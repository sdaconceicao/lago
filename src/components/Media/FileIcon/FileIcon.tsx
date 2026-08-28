"use client";
import clsx from "clsx";
import { File as FileGlyph } from "lucide-react";
import {
  DEFAULT_FILE_ICON_SIZE,
  type FileIconSize,
  getFileExtensionLabel,
} from "./FileIcon.utils";
import styles from "./FileIcon.module.css";

export type { FileIconSize };
export { DEFAULT_FILE_ICON_SIZE, getFileExtensionLabel };

export interface FileIconProps {
  /**
   * File name used to derive the extension badge. `invoice.pdf` shows `PDF`; a
   * name with no extension renders the document glyph alone.
   */
  fileName: string;
  /**
   * The size of the icon: 32px, 40px, or 48px. `md` matches the FileUploader
   * list thumbnail.
   *
   * @default 'md'
   */
  size?: FileIconSize;
  /** CSS class name merged onto the root element. */
  className?: string;
}

/**
 * A document glyph with a small extension badge overlaid on it. Use it wherever
 * a file type needs a compact mark — a FileUploader row, an attachment chip,
 * a document list.
 */
export function FileIcon({
  fileName,
  size = DEFAULT_FILE_ICON_SIZE,
  className,
}: FileIconProps) {
  const extension = getFileExtensionLabel(fileName);

  return (
    <div
      className={clsx(styles.fileIcon, className)}
      data-file-icon-size={size}
      aria-hidden="true"
    >
      <FileGlyph className={styles.fileGlyph} strokeWidth={1.5} />
      {extension ? (
        <span className={styles.fileTypeBadge}>{extension}</span>
      ) : null}
    </div>
  );
}
