"use client";
import clsx from "clsx";
import { File as FileIcon, X } from "lucide-react";
import type { CSSProperties } from "react";
import { IconButton } from "@/components/Actions/IconButton/IconButton";
import { Link } from "@/components/Actions/Link/Link";
import base from "@/styles/base.module.css";
import {
  type FileUploaderVariant,
  type FileUploadItem,
  formatFileSize,
  getProgressPercent,
  getStatusMessage,
  isImageFile,
} from "../FileUploader.utils";
import styles from "./FileUploaderItemRow.module.css";

export interface FileUploaderItemRowProps {
  /** The selected file to render. */
  item: FileUploadItem;
  /** Disables the remove and retry actions. */
  isDisabled?: boolean;
  /**
   * Shape of the row. `"round"` uses a pill outline and circular thumbnail.
   *
   * @default 'default'
   */
  variant?: FileUploaderVariant;
  /** Called when the user removes this file. */
  onRemove: (item: FileUploadItem) => void;
  /** Called when the user retries a failed upload. */
  onRetry?: (item: FileUploadItem) => void;
}

/**
 * One selected file in the FileUploader list: thumbnail or icon, name, optional
 * progress or error, and a remove control.
 */
export function FileUploaderItemRow({
  item,
  isDisabled,
  variant = "default",
  onRemove,
  onRetry,
}: FileUploaderItemRowProps) {
  const status = item.status ?? "idle";
  const showProgress = status === "uploading" || status === "complete";
  const progress = getProgressPercent(item);

  return (
    <li className={clsx(styles.fileItem, variant === "round" && styles.round)}>
      {item.previewUrl && isImageFile(item.file) ? (
        <img
          src={item.previewUrl}
          alt=""
          className={styles.thumbnail}
          aria-hidden="true"
        />
      ) : (
        <div className={styles.fileIcon} aria-hidden="true">
          <FileIcon size={20} strokeWidth={1.75} />
        </div>
      )}

      <div className={styles.fileDetails}>
        <span className={styles.fileName}>{item.file.name}</span>
        <span className={styles.fileMeta}>
          {formatFileSize(item.file.size)}
        </span>

        {showProgress && (
          <>
            <div
              className={clsx(base.track, base.inset, styles.progressTrack)}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${progress}%`}
              aria-label={`Upload progress for ${item.file.name}`}
            >
              <div
                className={styles.progressFill}
                style={
                  {
                    "--percent": `${progress}%`,
                  } as CSSProperties
                }
              />
            </div>
            <div
              className={clsx(
                styles.fileStatusRow,
                status === "complete" && styles.fileStatusRowComplete
              )}
            >
              <span>{getStatusMessage(item)}</span>
              <span className={styles.fileStatusPercent}>{progress}%</span>
            </div>
          </>
        )}

        {status === "error" && (
          <div
            className={clsx(styles.fileStatusRow, styles.fileStatusRowError)}
          >
            <span>{getStatusMessage(item)}</span>
            {onRetry && (
              <Link onPress={() => onRetry(item)} isDisabled={isDisabled}>
                Try again
              </Link>
            )}
          </div>
        )}
      </div>

      <IconButton
        aria-label={`Remove ${item.file.name}`}
        variant="quiet"
        size="sm"
        className={styles.removeButton}
        isDisabled={isDisabled}
        onPress={() => onRemove(item)}
      >
        <X size={16} strokeWidth={2} />
      </IconButton>
    </li>
  );
}
