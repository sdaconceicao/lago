"use client";
import clsx from "clsx";
import { CloudUpload, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { FileTrigger } from "react-aria-components/FileTrigger";
import { IconButton } from "@/components/Actions/IconButton/IconButton";
import { Link } from "@/components/Actions/Link/Link";
import { DropZone } from "@/components/Inputs/DropZone/DropZone";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
import { SlottedText } from "@/components/Typography/index";
import type {
  FileUploaderVariant,
  FileUploadItem,
} from "../FileUploader/FileUploader.utils";
import styles from "./FileUploaderDropZone.module.css";

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
  /** Single image shown inside a round drop zone, when one is selected. */
  circlePreviewItem?: FileUploadItem;
  /** Called with the files chosen from the file picker. */
  onSelect: (files: FileList) => void;
  /** Called with the React Aria drop event when files are dropped. */
  onDrop: NonNullable<ComponentProps<typeof DropZone>["onDrop"]>;
  /** Called when the user removes the image filling a round drop zone. */
  onRemovePreview: (item: FileUploadItem) => void;
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
  circlePreviewItem,
  onSelect,
  onDrop,
  onRemovePreview,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: FileUploaderDropZoneProps) {
  let triggerContent: ReactNode;
  if (circlePreviewItem) {
    triggerContent = (
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
  if (circlePreviewItem) {
    dropZoneContent = (
      <>
        {fileTrigger}
        <IconButton
          aria-label={`Remove ${circlePreviewItem.file.name}`}
          variant="secondary"
          size="sm"
          className={styles.circleRemove}
          isDisabled={isDisabled}
          onPress={() => onRemovePreview(circlePreviewItem)}
        >
          <X size={16} strokeWidth={2} />
        </IconButton>
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

  const roundLabel = circlePreviewItem
    ? `Replace ${circlePreviewItem.file.name}`
    : "Upload file";

  return (
    <DropZone
      size={size}
      isDisabled={isDisabled}
      className={clsx(styles.dropZone, variant === "round" && styles.round)}
      onDrop={onDrop}
      getDropOperation={() => "copy"}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel ?? (variant === "round" ? roundLabel : undefined)}
    >
      <div className={styles.dropZoneContent}>{dropZoneContent}</div>
    </DropZone>
  );
}
