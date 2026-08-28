"use client";
import clsx from "clsx";
import {
  FieldErrorContext,
  type ValidationResult,
} from "react-aria-components/FieldError";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import { Text } from "@/components/Typography/index";
import { FileUploaderDropZone } from "./BaseComponents/FileUploaderDropZone";
import { FileUploaderItemRow } from "./BaseComponents/FileUploaderItemRow";
import styles from "./FileUploader.module.css";
import type {
  FileUploaderVariant,
  FileUploadItem,
  FileUploadStatus,
} from "./FileUploader.utils";
import { useFileUploader } from "./Hooks/useFileUploader";

export type { FileUploaderVariant, FileUploadItem, FileUploadStatus };

export interface FileUploaderProps {
  /** Accessible label rendered above the drop zone. */
  label?: string;
  /** Helper text rendered below the drop zone. */
  description?: string;
  /** Constraint text rendered below the drop zone, e.g. accepted types or size limits. */
  hint?: string;
  /** Error message shown when the field is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Drop zone size: 48px, 72px, or 96px minimum height. Defaults to `"md"`. */
  size?: FieldSize;
  /** Disables file selection and drag-and-drop. */
  isDisabled?: boolean;
  /** Marks the field invalid and shows `errorMessage`. */
  isInvalid?: boolean;
  /** Marks the field required. Appends an asterisk to the label. */
  isRequired?: boolean;
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
  isInvalid,
  isRequired,
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
  const {
    addFiles,
    handleDrop,
    handleRemove,
    acceptedFileTypes,
    circlePreviewItem,
    listItems,
    validation,
    labelId,
    descriptionId,
    hintId,
    describedBy,
  } = useFileUploader({
    value,
    defaultValue,
    onChange,
    onRemove,
    allowsMultiple,
    accept,
    maxSize,
    variant,
    isInvalid,
    errorMessage,
    description,
    hint,
  });

  return (
    <div
      className={clsx(
        "react-aria-FileUploader",
        styles.fileUploader,
        className
      )}
      data-variant={variant}
      data-field-size={size}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
    >
      <FieldErrorContext.Provider value={validation}>
        {label && (
          <Label id={labelId} isRequired={isRequired}>
            {label}
          </Label>
        )}

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
          aria-describedby={describedBy}
        />

        {hint && (
          <Text id={hintId} className={styles.hint}>
            {hint}
          </Text>
        )}

        {listItems.length > 0 && (
          <ul className={styles.fileList}>
            {listItems.map((item) => (
              <FileUploaderItemRow
                key={item.id}
                item={item}
                variant={variant}
                isDisabled={isDisabled}
                onRemove={handleRemove}
                onRetry={onRetry}
              />
            ))}
          </ul>
        )}

        {description && (
          <Description id={descriptionId}>{description}</Description>
        )}
        <FieldError>{errorMessage}</FieldError>
      </FieldErrorContext.Provider>
    </div>
  );
}
