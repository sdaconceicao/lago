import type { ValidationResult } from "react-aria-components/FieldError";
import { isFileDropItem } from "react-aria-components/useDrop";

type DropItem = Parameters<typeof isFileDropItem>[0];

export const EMPTY_VALIDATION: ValidationResult = {
  isInvalid: false,
  validationErrors: [],
  validationDetails: {
    valid: true,
    badInput: false,
    customError: false,
    patternMismatch: false,
    rangeOverflow: false,
    rangeUnderflow: false,
    stepMismatch: false,
    tooLong: false,
    tooShort: false,
    typeMismatch: false,
    valueMissing: false,
  },
};

/** FieldErrorContext value for an optional `isInvalid` / `errorMessage` pair. */
export const getFieldValidation = (
  isInvalid?: boolean,
  errorMessage?: string | ((validation: ValidationResult) => string)
): ValidationResult => {
  if (!isInvalid) {
    return EMPTY_VALIDATION;
  }

  return {
    isInvalid: true,
    validationErrors: typeof errorMessage === "string" ? [errorMessage] : [],
    validationDetails: {
      ...EMPTY_VALIDATION.validationDetails,
      valid: false,
      customError: true,
    },
  };
};

/** Lifecycle state for a file the parent may be uploading. */
export type FileUploadStatus = "idle" | "uploading" | "complete" | "error";

/** Shape variant for the drop zone and file list rows. */
export type FileUploaderVariant = "default" | "round";

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
export const getFilesFromDropEvent = async (event: {
  items: Iterable<DropItem>;
}): Promise<File[]> => {
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

/** Status copy shown on a file row. */
export const getStatusMessage = (item: FileUploadItem): string => {
  switch (item.status) {
    case "uploading":
      return "Uploading…";
    case "complete":
      return "Complete";
    case "error":
      return item.errorMessage ?? "Upload failed";
    default:
      return "";
  }
};

/** Progress to display, clamped to 0–100. Complete items without a value read as 100. */
export const getProgressPercent = (item: FileUploadItem): number => {
  const progress = item.progress ?? 0;

  if (item.status === "complete") {
    return progress || 100;
  }

  return Math.min(100, Math.max(0, progress));
};

/**
 * The image shown inside a round, single-file drop zone. Anything else — a
 * second file, a non-image, or an in-flight upload — keeps the list row.
 */
export const getCirclePreviewItem = (
  variant: FileUploaderVariant,
  items: FileUploadItem[],
  allowsMultiple: boolean
): FileUploadItem | undefined => {
  if (variant !== "round" || allowsMultiple || items.length !== 1) {
    return undefined;
  }

  const [item] = items;

  if (
    !item.previewUrl ||
    !isImageFile(item.file) ||
    item.status === "uploading" ||
    item.status === "error"
  ) {
    return undefined;
  }

  return item;
};

/** Files shown in the list under the drop zone. The circle preview is omitted. */
export const getListItems = (
  items: FileUploadItem[],
  circlePreviewItem?: FileUploadItem
): FileUploadItem[] =>
  circlePreviewItem
    ? items.filter((item) => item.id !== circlePreviewItem.id)
    : items;
