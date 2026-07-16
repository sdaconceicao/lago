"use client";
import type React from "react";
import clsx from "clsx";
import {
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult,
} from "react-aria-components/TextField";
import {
  Description,
  FieldError,
  Label,
} from "@/components/Inputs/FormComponents/index";
import utils from "@/styles/utilities.module.css";
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
  ...props
}: TextAreaProps) {
  return (
    <AriaTextField
      {...props}
      className={clsx("react-aria-TextField", styles.textArea, props.className)}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      <AriaTextArea
        ref={inputRef}
        className={clsx("react-aria-TextArea", styles.input, utils.inset)}
        placeholder={placeholder}
      />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
