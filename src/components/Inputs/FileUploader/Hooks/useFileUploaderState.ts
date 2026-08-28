"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createFileUploadItem,
  type FileRejectReason,
  type FileUploadItem,
  partitionFiles,
} from "../FileUploader.utils";

export interface UseFileUploaderStateOptions {
  /** Selected files, when controlled. */
  value?: FileUploadItem[];
  /** Initially selected files, when uncontrolled. */
  defaultValue?: FileUploadItem[];
  /** Called when the file list changes. */
  onChange?: (items: FileUploadItem[]) => void;
  /**
   * Called when files are refused before they enter the list — they failed
   * `accept` or `maxSize`.
   */
  onReject?: (files: File[], reason: FileRejectReason) => void;
  /** Whether multiple files can be selected. */
  allowsMultiple: boolean;
  /** MIME types or extensions passed to the file input's accept attribute. */
  accept?: string;
  /** Maximum file size in bytes. Files over this limit are ignored. */
  maxSize?: number;
}

/**
 * Selection state for a FileUploader, including preview URL lifecycle.
 *
 * Only blob URLs minted by this hook are revoked — when they leave the list or
 * when the hook unmounts — so a parent that supplied its own preview URLs keeps
 * them.
 */
export const useFileUploaderState = ({
  value,
  defaultValue,
  onChange,
  onReject,
  allowsMultiple,
  accept,
  maxSize,
}: UseFileUploaderStateOptions) => {
  const [uncontrolledItems, setUncontrolledItems] = useState<FileUploadItem[]>(
    () => defaultValue ?? []
  );
  const ownedPreviewUrlsRef = useRef<Set<string>>(new Set());
  const items = value ?? uncontrolledItems;
  const previousItemsRef = useRef(items);

  const trackPreviewUrl = useCallback((previewUrl?: string) => {
    if (previewUrl) {
      ownedPreviewUrlsRef.current.add(previewUrl);
    }
  }, []);

  const releasePreviewUrl = useCallback((previewUrl?: string) => {
    if (!previewUrl) {
      return;
    }

    if (ownedPreviewUrlsRef.current.delete(previewUrl)) {
      URL.revokeObjectURL(previewUrl);
    }
  }, []);

  const setItems = useCallback(
    (nextItems: FileUploadItem[]) => {
      if (value == null) {
        setUncontrolledItems(nextItems);
      }

      onChange?.(nextItems);
    },
    [onChange, value]
  );

  const addFiles = useCallback(
    (files: FileList | readonly File[]) => {
      const { accepted, rejectedByMaxSize, rejectedByAccept } = partitionFiles(
        Array.from(files),
        accept,
        maxSize
      );

      if (rejectedByMaxSize.length) {
        onReject?.(rejectedByMaxSize, "maxSize");
      }

      if (rejectedByAccept.length) {
        onReject?.(rejectedByAccept, "accept");
      }

      if (!accepted.length) {
        return;
      }

      const newItems = accepted.map((file) => {
        const item = createFileUploadItem(file);
        trackPreviewUrl(item.previewUrl);
        return item;
      });

      if (!allowsMultiple) {
        for (const item of items) {
          releasePreviewUrl(item.previewUrl);
        }
      }

      const nextItems = allowsMultiple
        ? [...items, ...newItems]
        : newItems.slice(0, 1);

      setItems(nextItems);
    },
    [
      accept,
      allowsMultiple,
      items,
      maxSize,
      onReject,
      releasePreviewUrl,
      setItems,
      trackPreviewUrl,
    ]
  );

  const removeItem = useCallback(
    (item: FileUploadItem) => {
      releasePreviewUrl(item.previewUrl);
      setItems(items.filter((current) => current.id !== item.id));
    },
    [items, releasePreviewUrl, setItems]
  );

  useEffect(() => {
    const previousItems = previousItemsRef.current;
    previousItemsRef.current = items;
    const currentUrls = new Set(
      items.flatMap((item) => (item.previewUrl ? [item.previewUrl] : []))
    );

    for (const item of previousItems) {
      if (item.previewUrl && !currentUrls.has(item.previewUrl)) {
        releasePreviewUrl(item.previewUrl);
      }
    }
  }, [items, releasePreviewUrl]);

  useEffect(
    () => () => {
      ownedPreviewUrlsRef.current.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
      ownedPreviewUrlsRef.current.clear();
    },
    []
  );

  return {
    items,
    addFiles,
    removeItem,
  };
};
