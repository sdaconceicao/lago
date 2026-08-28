"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createFileUploadItem,
  type FileUploadItem,
  filterAcceptedFiles,
} from "../FileUploader.utils";

export interface UseFileUploaderStateOptions {
  /** Selected files, when controlled. */
  value?: FileUploadItem[];
  /** Initially selected files, when uncontrolled. */
  defaultValue?: FileUploadItem[];
  /** Called when the file list changes. */
  onChange?: (items: FileUploadItem[]) => void;
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
 * Blob URLs are revoked when items are removed and when the hook unmounts so
 * long-lived forms do not leak memory.
 */
export const useFileUploaderState = ({
  value,
  defaultValue,
  onChange,
  allowsMultiple,
  accept,
  maxSize,
}: UseFileUploaderStateOptions) => {
  const [uncontrolledItems, setUncontrolledItems] = useState<FileUploadItem[]>(
    () => defaultValue ?? []
  );
  const ownedPreviewUrlsRef = useRef<Set<string>>(new Set());

  const items = value ?? uncontrolledItems;

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
      const acceptedFiles = filterAcceptedFiles(
        Array.from(files),
        accept,
        maxSize
      );

      if (!acceptedFiles.length) {
        return;
      }

      const newItems = acceptedFiles.map((file) => {
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
    for (const item of defaultValue ?? []) {
      trackPreviewUrl(item.previewUrl);
    }
  }, [defaultValue, trackPreviewUrl]);

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
