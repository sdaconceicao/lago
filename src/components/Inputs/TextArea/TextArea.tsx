"use client";
import clsx from "clsx";
import type React from "react";
import {
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult,
} from "react-aria-components/TextField";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import base from "@/styles/base.module.css";
import styles from "./TextArea.module.css";

export interface TextAreaProps extends AriaTextFieldProps {
  /** Accessible label rendered above the field. */
  label?: string;
  /** Helper text rendered below the field. */
  description?: string;
  /** Error message shown when the field is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Placeholder text shown while the field is empty. */
  placeholder?: string;
  /** Ref forwarded to the underlying `textarea` element. */
  inputRef?: React.Ref<HTMLTextAreaElement>;
  /** Sets text size and padding using the shared field scale. */
  size?: FieldSize;
  /** Number of visible text lines. Defaults to the native textarea's two rows. */
  rows?: number;
}

/**
 * A multi-line text input for longer freeform content such as comments or
 * descriptions. Shares the label, help text, and inset field styling of
 * TextField so the two line up when stacked in a form.
 */
export function TextArea({
  label,
  description,
  errorMessage,
  placeholder,
  inputRef,
  rows,
  size = DEFAULT_FIELD_SIZE,
  ...props
}: TextAreaProps) {
  return (
    <AriaTextField
      {...props}
      data-field-size={size}
      className={clsx("react-aria-TextField", styles.textArea, props.className)}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      <AriaTextArea
        ref={inputRef}
        className={clsx("react-aria-TextArea", styles.input, base.inset)}
        placeholder={placeholder}
        rows={rows}
      />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
