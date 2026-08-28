"use client";
import clsx from "clsx";
import { File as FileGlyph } from "lucide-react";
import styles from "./FileIcon.module.css";
import {
  DEFAULT_FILE_ICON_SIZE,
  type FileIconSize,
  getFileExtensionLabel,
} from "./FileIcon.utils";

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
  /**
   * Accessible name when the icon is not decorative. Passing this shows the
   * icon to assistive technology as an image.
   */
  "aria-label"?: string;
  /**
   * Whether the icon is hidden from assistive technology. Defaults to `true`
   * when there is no `aria-label`, and to `false` when there is one.
   */
  "aria-hidden"?: boolean;
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
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: FileIconProps) {
  const extension = getFileExtensionLabel(fileName);
  const isDecorative = ariaHidden ?? !ariaLabel;

  return (
    <div
      className={clsx(styles.fileIcon, className)}
      data-file-icon-size={size}
      role="img"
      aria-label={isDecorative ? undefined : ariaLabel}
      aria-hidden={isDecorative || undefined}
    >
      <FileGlyph className={styles.fileGlyph} strokeWidth={1.5} />
      {extension ? (
        <span className={styles.fileTypeBadge}>{extension}</span>
      ) : null}
    </div>
  );
}
