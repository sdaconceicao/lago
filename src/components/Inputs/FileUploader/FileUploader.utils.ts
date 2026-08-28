import type { DropEvent } from "react-aria";
import { isFileDropItem } from "react-aria-components/useDrop";

/** Lifecycle state for a file the parent may be uploading. */
export type FileUploadStatus = "idle" | "uploading" | "complete" | "error";

/** A selected file and optional upload metadata supplied by the caller. */
export interface FileUploadItem {
  /** Stable key for list rendering. */
  id: string;
  /** The underlying browser file. */
  file: File;
  /** Object URL for image previews. Revoked when the item is removed. */
  previewUrl?: string;
  /** Upload lifecycle state. Defaults to `"idle"`. */
  status?: FileUploadStatus;
  /** Upload progress from 0 to 100 when `status` is `"uploading"` or `"complete"`. */
  progress?: number;
  /** Message shown when `status` is `"error"`. */
  errorMessage?: string;
}

/** Returns whether a file is an image the browser can preview. */
export const isImageFile = (file: File): boolean =>
  file.type.startsWith("image/");

/** Formats a byte count for display, e.g. `720 KB`. */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Parses an HTML `accept` string into the array `FileTrigger` expects. */
export const parseAcceptedFileTypes = (
  accept?: string
): string[] | undefined => {
  if (!accept) {
    return undefined;
  }

  return accept
    .split(",")
    .map((type) => type.trim())
    .filter(Boolean);
};

/** Returns whether a file matches an HTML `accept` attribute value. */
export const fileMatchesAccept = (file: File, accept?: string): boolean => {
  const acceptedTypes = parseAcceptedFileTypes(accept);

  if (!acceptedTypes?.length) {
    return true;
  }

  return acceptedTypes.some((type) => {
    if (type.startsWith(".")) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }

    if (type.endsWith("/*")) {
      const prefix = type.slice(0, -1);
      return file.type.startsWith(prefix);
    }

    return file.type === type;
  });
};

/** Returns whether a file is within the optional size limit. */
export const fileMatchesMaxSize = (file: File, maxSize?: number): boolean =>
  maxSize == null || file.size <= maxSize;

/** Creates a list item from a browser file, minting a preview URL for images. */
export const createFileUploadItem = (file: File): FileUploadItem => ({
  id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
  file,
  previewUrl: isImageFile(file) ? URL.createObjectURL(file) : undefined,
  status: "idle",
});

/** Reads dropped files from a React Aria drop event. */
export const getFilesFromDropEvent = async (
  event: DropEvent
): Promise<File[]> => {
  const files: File[] = [];

  for (const item of event.items) {
    if (isFileDropItem(item)) {
      files.push(await item.getFile());
    }
  }

  return files;
};

/** Filters files by accept and max size before they enter the list. */
export const filterAcceptedFiles = (
  files: File[],
  accept?: string,
  maxSize?: number
): File[] =>
  files.filter(
    (file) =>
      fileMatchesAccept(file, accept) && fileMatchesMaxSize(file, maxSize)
  );

/** Revokes any preview URLs on the given items. */
export const revokePreviewUrls = (items: FileUploadItem[]): void => {
  for (const item of items) {
    if (item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  }
};
