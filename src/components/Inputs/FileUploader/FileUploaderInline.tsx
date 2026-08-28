"use client";
import clsx from "clsx";
import { CloudUpload } from "lucide-react";
import { FieldErrorContext } from "react-aria-components/FieldError";
import { FileTrigger } from "react-aria-components/FileTrigger";
import { Link } from "@/components/Actions/Link/Link";
import { DropZone } from "@/components/Inputs/DropZone/DropZone";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import { SlottedText, Text } from "@/components/Typography/index";
import { FileUploaderItemRow } from "./BaseComponents/FileUploaderItemRow";
import type { FileUploaderProps } from "./FileUploader";
import styles from "./FileUploaderInline.module.css";
import { useFileUploader } from "./Hooks/useFileUploader";

export interface FileUploaderInlineProps
  extends Omit<FileUploaderProps, "variant" | "size" | "allowsMultiple"> {
  /**
   * Field size: 28px, 36px (default), or 48px tall, matching TextField.
   *
   * @default 'md'
   */
  size?: FieldSize;
  /**
   * Whether multiple files can be selected. Defaults to `false` — a single-line
   * field typically holds one file.
   */
  allowsMultiple?: boolean;
}

/**
 * A single-line file field at TextField height. Selected files render as chips
 * inside the field, with a trailing remove control. Prefer this in form rows;
 * use FileUploader for a dashed drop area or circular image target.
 */
export function FileUploaderInline({
  label,
  description,
  hint,
  errorMessage,
  size = DEFAULT_FIELD_SIZE,
  isDisabled,
  isInvalid,
  isRequired,
  accept,
  allowsMultiple = false,
  maxSize,
  value,
  defaultValue,
  onChange,
  onReject,
  onRemove,
  onRetry,
  className,
}: FileUploaderInlineProps) {
  const {
    addFiles,
    handleDrop,
    handleRemove,
    acceptedFileTypes,
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
    onReject,
    onRemove,
    allowsMultiple,
    accept,
    maxSize,
    isInvalid,
    errorMessage,
    description,
    hint,
  });

  const fileTrigger = (
    <FileTrigger
      acceptedFileTypes={acceptedFileTypes}
      allowsMultiple={allowsMultiple}
      onSelect={(files) => {
        if (files) {
          addFiles(files);
        }
      }}
    >
      {listItems.length > 0 ? (
        <Link
          className={styles.add}
          isDisabled={isDisabled}
          aria-label="Add files"
        >
          Add
        </Link>
      ) : (
        <Link isDisabled={isDisabled}>Click to upload</Link>
      )}
    </FileTrigger>
  );

  const instructions = <>{fileTrigger} or drag and drop</>;

  return (
    <fieldset
      className={clsx(
        "react-aria-FileUploaderInline",
        styles.fileUploader,
        className
      )}
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={describedBy}
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

        <DropZone
          size={size}
          isDisabled={isDisabled}
          className={styles.dropZone}
          onDrop={handleDrop}
          getDropOperation={() => "copy"}
          aria-labelledby={label ? labelId : undefined}
          aria-label={label}
        >
          <div className={styles.dropZoneContent}>
            {listItems.length > 0 ? (
              <>
                <ul className={styles.fileList}>
                  {listItems.map((item) => (
                    <FileUploaderItemRow
                      key={item.id}
                      item={item}
                      variant="inline"
                      isDisabled={isDisabled}
                      onRemove={handleRemove}
                      onRetry={onRetry}
                    />
                  ))}
                </ul>
                {allowsMultiple ? fileTrigger : null}
              </>
            ) : (
              <>
                <CloudUpload
                  className={styles.dropZoneIcon}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {label ? (
                  <span className={styles.dropZoneText}>{instructions}</span>
                ) : (
                  <SlottedText slot="label" className={styles.dropZoneText}>
                    {instructions}
                  </SlottedText>
                )}
              </>
            )}
          </div>
        </DropZone>

        {hint && (
          <Text id={hintId} className={styles.hint}>
            {hint}
          </Text>
        )}

        {description && (
          <Description id={descriptionId}>{description}</Description>
        )}
        <FieldError>{errorMessage}</FieldError>
      </FieldErrorContext.Provider>
    </fieldset>
  );
}
