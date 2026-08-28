"use client";
import { useCallback, useId, useMemo } from "react";
import type { ValidationResult } from "react-aria-components/FieldError";
import {
  type FileUploadItem,
  getDropZoneItem,
  getFieldValidation,
  getFilesFromDropEvent,
  getListItems,
  parseAcceptedFileTypes,
} from "../FileUploader/FileUploader.utils";
import {
  type UseFileUploaderStateOptions,
  useFileUploaderState,
} from "./useFileUploaderState";

export interface UseFileUploaderOptions extends UseFileUploaderStateOptions {
  /** Called when the user removes a file. */
  onRemove?: (item: FileUploadItem) => void;
  /** Marks the field invalid and shows `errorMessage`. */
  isInvalid?: boolean;
  /** Error message shown when the field is invalid. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Helper text rendered below the drop zone. */
  description?: string;
  /** Constraint text rendered below the drop zone. */
  hint?: string;
}

/**
 * Field-facing FileUploader state: drop and remove handlers, derived lists, and
 * the field chrome the component renders.
 */
export const useFileUploader = ({
  onRemove,
  isInvalid,
  errorMessage,
  description,
  hint,
  accept,
  allowsMultiple,
  ...stateOptions
}: UseFileUploaderOptions) => {
  const { items, addFiles, removeItem } = useFileUploaderState({
    ...stateOptions,
    accept,
    allowsMultiple,
  });

  const handleDrop = useCallback(
    async (event: Parameters<typeof getFilesFromDropEvent>[0]) => {
      const files = await getFilesFromDropEvent(event);
      addFiles(files);
    },
    [addFiles]
  );

  const handleRemove = useCallback(
    (item: FileUploadItem) => {
      removeItem(item);
      onRemove?.(item);
    },
    [onRemove, removeItem]
  );

  const labelId = useId();
  const descriptionId = useId();
  const hintId = useId();
  const acceptedFileTypes = useMemo(
    () => parseAcceptedFileTypes(accept),
    [accept]
  );
  const dropZoneItem = useMemo(
    () => getDropZoneItem(items, allowsMultiple),
    [allowsMultiple, items]
  );
  const listItems = useMemo(
    () => getListItems(items, dropZoneItem),
    [dropZoneItem, items]
  );
  const validation = useMemo(
    () => getFieldValidation(isInvalid, errorMessage),
    [errorMessage, isInvalid]
  );
  const describedBy =
    [description ? descriptionId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return {
    items,
    addFiles,
    handleDrop,
    handleRemove,
    acceptedFileTypes,
    dropZoneItem,
    listItems,
    validation,
    labelId,
    descriptionId,
    hintId,
    describedBy,
  };
};
