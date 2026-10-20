"use client";
import clsx from "clsx";
import { CloudUpload, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { FileTrigger } from "react-aria-components/FileTrigger";
import { IconButton } from "@/components/Actions/IconButton/IconButton";
import { Link } from "@/components/Actions/Link/Link";
import { ProgressCircle } from "@/components/Feedback/ProgressCircle/ProgressCircle";
import { DropZone } from "@/components/Inputs/DropZone/DropZone";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
import { FileIcon } from "@/components/Media/FileIcon/FileIcon";
import { SlottedText } from "@/components/Typography/index";
import {
  type FileUploaderVariant,
  type FileUploadItem,
  getProgressPercent,
  getStatusMessage,
  isImageFile,
} from "../FileUploader/FileUploader.utils";
import styles from "./FileUploaderDropZone.module.css";

const CIRCLE_PROGRESS_SIZE: Record<FieldSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
};

export interface FileUploaderDropZoneProps {
  /** Shape of the drop zone. `"round"` is circular. */
  variant: FileUploaderVariant;
  /** Drop zone size: 48px, 72px, or 96px minimum height. */
  size: FieldSize;
  /** Disables file selection and drag-and-drop. */
  isDisabled?: boolean;
  /** Whether multiple files can be selected. */
  allowsMultiple: boolean;
  /** MIME types or extensions passed to the file input's accept attribute. */
  acceptedFileTypes?: string[];
  /** Single file occupying the drop zone when multiple files are not allowed. */
  filledItem?: FileUploadItem;
  /** Called with the files chosen from the file picker. */
  onSelect: (files: FileList) => void;
  /** Called with the React Aria drop event when files are dropped. */
  onDrop: NonNullable<ComponentProps<typeof DropZone>["onDrop"]>;
  /** Called when the user removes the file occupying the drop zone. */
  onRemovePreview: (item: FileUploadItem) => void;
  /** Called when the user retries a failed upload in a round drop zone. */
  onRetry?: (item: FileUploadItem) => void;
  /**
   * File card rendered inside a default drop zone when a single file occupies
   * it. Round drop zones render the file themselves.
   */
  children?: ReactNode;
  /**
   * Accessible name for the drop target. Overrides React Aria's default
   * `"DropZone"` label — typically the visible field label.
   */
  "aria-label"?: string;
  /** Id of the visible field label that names this drop zone. */
  "aria-labelledby"?: string;
}

/**
 * The FileUploader drop target. Click-to-browse is a FileTrigger wrapping a
 * Link, because DropZone already renders a visually hidden button.
 */
export function FileUploaderDropZone({
  variant,
  size,
  isDisabled,
  allowsMultiple,
  acceptedFileTypes,
  filledItem,
  onSelect,
  onDrop,
  onRemovePreview,
  onRetry,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: FileUploaderDropZoneProps) {
  const filledStatus = filledItem?.status ?? "idle";
  const isFilledBusy = filledStatus === "uploading" || filledStatus === "error";
  const isRoundFilled = Boolean(filledItem) && variant === "round";
  const isDefaultFilled = Boolean(filledItem) && variant !== "round";
  const showCircleImage = Boolean(
    filledItem?.previewUrl && isImageFile(filledItem.file)
  );

  let triggerContent: ReactNode;
  if (isRoundFilled && filledItem) {
    triggerContent = (
      <Link
        className={styles.circlePreviewButton}
        isDisabled={isDisabled}
        aria-label={`Replace ${filledItem.file.name}`}
      >
        {showCircleImage ? (
          <img
            src={filledItem.previewUrl}
            alt=""
            className={styles.circlePreview}
            aria-hidden="true"
          />
        ) : (
          <FileIcon
            fileName={filledItem.file.name}
            className={styles.circleFileIcon}
          />
        )}
        {!isFilledBusy && (
          <span className={styles.circleOverlay} aria-hidden="true">
            <CloudUpload strokeWidth={1.5} />
          </span>
        )}
      </Link>
    );
  } else if (variant === "round") {
    triggerContent = (
      <Link
        className={styles.circleTrigger}
        isDisabled={isDisabled}
        aria-label="Upload file"
      >
        <CloudUpload
          className={styles.dropZoneIcon}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </Link>
    );
  } else if (isDefaultFilled && filledItem) {
    triggerContent = (
      <Link
        className={styles.replaceTrigger}
        isDisabled={isDisabled}
        aria-label={`Replace ${filledItem.file.name}`}
      />
    );
  } else {
    triggerContent = <Link isDisabled={isDisabled}>Click to upload</Link>;
  }

  const fileTrigger = (
    <FileTrigger
      acceptedFileTypes={acceptedFileTypes}
      allowsMultiple={allowsMultiple}
      onSelect={(files) => {
        if (files) {
          onSelect(files);
        }
      }}
    >
      {triggerContent}
    </FileTrigger>
  );

  let dropZoneContent: ReactNode;
  if (isRoundFilled && filledItem) {
    const progress = getProgressPercent(filledItem);
    dropZoneContent = (
      <>
        {fileTrigger}
        {filledStatus === "uploading" && (
          <div className={styles.circleStatus}>
            <ProgressCircle
              aria-label={`Upload progress for ${filledItem.file.name}`}
              value={progress}
              isIndeterminate={progress === 0}
              size={CIRCLE_PROGRESS_SIZE[size]}
            />
          </div>
        )}
        {filledStatus === "error" && (
          <div className={styles.circleStatus}>
            <span>{getStatusMessage(filledItem)}</span>
            {onRetry && (
              <Link onPress={() => onRetry(filledItem)} isDisabled={isDisabled}>
                Try again
              </Link>
            )}
          </div>
        )}
        <IconButton
          aria-label={`Remove ${filledItem.file.name}`}
          variant="secondary"
          size="sm"
          className={styles.circleRemove}
          isDisabled={isDisabled}
          onPress={() => onRemovePreview(filledItem)}
        >
          <X size={16} strokeWidth={2} />
        </IconButton>
      </>
    );
  } else if (isDefaultFilled) {
    dropZoneContent = (
      <>
        {fileTrigger}
        {children}
      </>
    );
  } else if (variant === "round") {
    dropZoneContent = fileTrigger;
  } else {
    const instructions = <>{fileTrigger} or drag and drop</>;
    dropZoneContent = (
      <>
        <CloudUpload
          className={styles.dropZoneIcon}
          strokeWidth={1.5}
          aria-hidden="true"
        />
        {ariaLabelledBy ? (
          <span className={styles.dropZoneText}>{instructions}</span>
        ) : (
          <SlottedText slot="label" className={styles.dropZoneText}>
            {instructions}
          </SlottedText>
        )}
      </>
    );
  }

  const filledLabel = filledItem
    ? `Replace ${filledItem.file.name}`
    : "Upload file";

  return (
    <DropZone
      size={size}
      isDisabled={isDisabled}
      className={clsx(
        styles.dropZone,
        variant === "round" && styles.round,
        filledItem && styles.filled
      )}
      onDrop={onDrop}
      getDropOperation={() => "copy"}
      aria-labelledby={ariaLabelledBy}
      aria-label={
        ariaLabel ??
        (variant === "round" || filledItem ? filledLabel : undefined)
      }
    >
      <div
        className={clsx(
          styles.dropZoneContent,
          isDefaultFilled && styles.filledContent
        )}
      >
        {dropZoneContent}
      </div>
    </DropZone>
  );
}
