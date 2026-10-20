export type FileIconSize = "sm" | "md" | "lg";

/** The size a FileIcon renders at when no `size` prop is passed. */
export const DEFAULT_FILE_ICON_SIZE: FileIconSize = "md";

/** Uppercase extension shown on the file icon badge, e.g. `PDF`. */
export const getFileExtensionLabel = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf(".");

  if (lastDot <= 0 || lastDot === fileName.length - 1) {
    return "";
  }

  return fileName
    .slice(lastDot + 1)
    .toUpperCase()
    .slice(0, 4);
};
