"use client";
import clsx from "clsx";
import { CloudUpload, File as FileIcon, X } from "lucide-react";
import type { CSSProperties } from "react";
import type { DropEvent } from "react-aria";
import { FileTrigger } from "react-aria-components/FileTrigger";
import type { ValidationResult } from "react-aria-components/TextField";
import { IconButton } from "@/components/Actions/IconButton/IconButton";
import { Link } from "@/components/Actions/Link/Link";
import { DropZone } from "@/components/Inputs/DropZone/DropZone";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import { Text } from "@/components/Typography/index";
import base from "@/styles/base.module.css";
import { useFileUploaderState } from "./FileUploader.hooks";
import styles from "./FileUploader.module.css";
import {
  formatFileSize,
  getFilesFromDropEvent,
  isImageFile,
  parseAcceptedFileTypes,
  type FileUploadItem,
  type FileUploadStatus,
} from "./FileUploader.utils";

export type { FileUploadItem, FileUploadStatus };

/** Shape variant for the drop zone and file list rows. */
export type FileUploaderVariant = "default" | "round";

export interface FileUploaderProps {
  /** Accessible label rendered above the drop zone. */
  label?: string;
  /** Helper text rendered below the label. */
  description?: string;
  /** Constraint text rendered below the drop zone, e.g. accepted types or size limits. */
  hint?: string;
  /** Error message shown when the field is invalid. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Drop zone size: 48px, 72px, or 96px minimum height. Defaults to `"md"`. */
  size?: FieldSize;
  /** Disables file selection and drag-and-drop. */
  isDisabled?: boolean;
  /** MIME types or extensions passed to the file input's accept attribute. */
  accept?: string;
  /** Whether multiple files can be selected. Defaults to `true`. */
  allowsMultiple?: boolean;
  /** Maximum file size in bytes. Files over this limit are ignored. */
  maxSize?: number;
  /** Selected files, when controlled. */
  value?: FileUploadItem[];
  /** Initially selected files, when uncontrolled. */
  defaultValue?: FileUploadItem[];
  /** Called when the file list changes. */
  onChange?: (items: FileUploadItem[]) => void;
  /** Called when the user removes a file. */
  onRemove?: (item: FileUploadItem) => void;
  /** Called when the user retries a failed upload. */
  onRetry?: (item: FileUploadItem) => void;
  /**
   * Shape variant. `"default"` uses the field border radius; `"round"` renders a
   * circular drop zone with the selected image shown inside it.
   *
   * @default 'default'
   */
  variant?: FileUploaderVariant;
  /** CSS class name merged onto the root element. */
  className?: string;
}

interface FileUploaderItemProps {
  item: FileUploadItem;
  isDisabled?: boolean;
  onRemove: (item: FileUploadItem) => void;
  onRetry?: (item: FileUploadItem) => void;
}

interface FileUploaderDropZoneProps {
  variant: FileUploaderVariant;
  size: FieldSize;
  isDisabled?: boolean;
  allowsMultiple: boolean;
  acceptedFileTypes?: string[];
  circlePreviewItem?: FileUploadItem;
  onSelect: (files: FileList) => void;
  onDrop: (event: DropEvent) => Promise<void>;
  onRemovePreview: (item: FileUploadItem) => void;
}

const getStatusMessage = (item: FileUploadItem): string => {
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

const getProgressPercent = (item: FileUploadItem): number => {
  const progress = item.progress ?? 0;

  if (item.status === "complete") {
    return progress || 100;
  }

  return Math.min(100, Math.max(0, progress));
};

const getCirclePreviewItem = (
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

function FileUploaderDropZone({
  variant,
  size,
  isDisabled,
  allowsMultiple,
  acceptedFileTypes,
  circlePreviewItem,
  onSelect,
  onDrop,
  onRemovePreview,
}: FileUploaderDropZoneProps) {
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
      {circlePreviewItem ? (
        <Link
          className={styles.circlePreviewButton}
          isDisabled={isDisabled}
          aria-label={`Replace ${circlePreviewItem.file.name}`}
        >
          <img
            src={circlePreviewItem.previewUrl}
            alt=""
            className={styles.circlePreview}
            aria-hidden="true"
          />
          <span className={styles.circleOverlay} aria-hidden="true">
            <CloudUpload strokeWidth={1.5} />
          </span>
        </Link>
      ) : variant === "round" ? (
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
      ) : (
        <Link isDisabled={isDisabled}>Click to upload</Link>
      )}
    </FileTrigger>
  );

  return (
    <DropZone
      size={size}
      isDisabled={isDisabled}
      className={styles.dropZone}
      onDrop={onDrop}
      getDropOperation={() => "copy"}
    >
      <div className={styles.dropZoneContent}>
        {circlePreviewItem ? (
          <>
            {fileTrigger}
            <IconButton
              aria-label={`Remove ${circlePreviewItem.file.name}`}
              variant="quiet"
              size="sm"
              className={styles.circleRemove}
              isDisabled={isDisabled}
              onPress={() => onRemovePreview(circlePreviewItem)}
            >
              <X size={16} strokeWidth={2} />
            </IconButton>
          </>
        ) : variant === "round" ? (
          fileTrigger
        ) : (
          <>
            <CloudUpload
              className={styles.dropZoneIcon}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <Text className={styles.dropZoneText}>
              {fileTrigger} or drag and drop
            </Text>
          </>
        )}
      </div>
    </DropZone>
  );
}

function FileUploaderItemRow({
  item,
  isDisabled,
  onRemove,
  onRetry,
}: FileUploaderItemProps) {
  const status = item.status ?? "idle";
  const showProgress = status === "uploading" || status === "complete";
  const progress = getProgressPercent(item);

  return (
    <li className={styles.fileItem}>
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

        {showProgress ? (
          <>
            <span className={styles.fileMeta}>
              {formatFileSize(item.file.size)}
            </span>
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
        ) : status === "error" ? (
          <>
            <span className={styles.fileMeta}>
              {formatFileSize(item.file.size)}
            </span>
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
          </>
        ) : (
          <span className={styles.fileMeta}>
            {formatFileSize(item.file.size)}
          </span>
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

/**
 * A file and image uploader with drag-and-drop, click-to-browse, and a list of
 * selected files. Image files show a thumbnail preview; other files show a
 * generic file icon. Upload progress and error states are supplied by the
 * caller through each item's `status`, `progress`, and `errorMessage`.
 */
export function FileUploader({
  label,
  description,
  hint,
  errorMessage,
  size = DEFAULT_FIELD_SIZE,
  isDisabled,
  accept,
  allowsMultiple = true,
  maxSize,
  value,
  defaultValue,
  onChange,
  onRemove,
  onRetry,
  variant = "default",
  className,
}: FileUploaderProps) {
  const { items, addFiles, removeItem } = useFileUploaderState({
    value,
    defaultValue,
    onChange,
    allowsMultiple,
    accept,
    maxSize,
  });

  const handleDrop = async (event: DropEvent) => {
    const files = await getFilesFromDropEvent(event);
    addFiles(files);
  };

  const handleRemove = (item: FileUploadItem) => {
    removeItem(item);
    onRemove?.(item);
  };

  const acceptedFileTypes = parseAcceptedFileTypes(accept);
  const circlePreviewItem = getCirclePreviewItem(
    variant,
    items,
    allowsMultiple
  );
  const listItems = circlePreviewItem
    ? items.filter((item) => item.id !== circlePreviewItem.id)
    : items;

  return (
    <div
      className={clsx(styles.fileUploader, className)}
      data-variant={variant}
    >
      {label && <Label>{label}</Label>}
      {description && <Description>{description}</Description>}

      <FileUploaderDropZone
        variant={variant}
        size={size}
        isDisabled={isDisabled}
        allowsMultiple={allowsMultiple}
        acceptedFileTypes={acceptedFileTypes}
        circlePreviewItem={circlePreviewItem}
        onSelect={addFiles}
        onDrop={handleDrop}
        onRemovePreview={handleRemove}
      />

      {hint && <Description className={styles.hint}>{hint}</Description>}

      {listItems.length > 0 && (
        <ul className={styles.fileList}>
          {listItems.map((item) => (
            <FileUploaderItemRow
              key={item.id}
              item={item}
              isDisabled={isDisabled}
              onRemove={handleRemove}
              onRetry={onRetry}
            />
          ))}
        </ul>
      )}

      {errorMessage && <FieldError>{errorMessage}</FieldError>}
    </div>
  );
}
