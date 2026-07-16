"use client";
import type React from "react";
import clsx from "clsx";
import { Group } from "react-aria-components/Group";
import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  Input,
  type ValidationResult,
} from "react-aria-components/TextField";
import {
  Description,
  FieldError,
  Label,
} from "@/components/Inputs/FormComponents/index";
import utils from "@/styles/utilities.module.css";
import styles from "./TextField.module.css";

export interface TextFieldProps<
  T = HTMLInputElement,
> extends AriaTextFieldProps {
  /** Accessible label rendered above the field. */
  label?: string;
  /** Helper text rendered below the field. */
  description?: string;
  /** Error message shown when the field is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Placeholder text shown while the field is empty. */
  placeholder?: string;
  /** Ref forwarded to the underlying `input` element. */
  inputRef?: React.Ref<T>;
  /**
   * Optional trailing control rendered inside the field, e.g. a FieldButton for
   * a clear or reveal-password action. When present, the input and button share
   * a single inset surface that matches the Select and DatePicker fields.
   */
  button?: React.ReactNode;
}

/**
 * A single-line text input with a label, optional description, placeholder, and
 * validation states. Its field sizing and padding match the Select and Date
 * fields so the controls align when stacked in a form.
 */
export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  inputRef,
  button,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      className={clsx(
        "react-aria-TextField",
        styles.textField,
        props.className
      )}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      {button ? (
        // The Group is the inset field surface; the input and trailing button
        // share it, mirroring the Select and DatePicker field groups.
        <Group
          isDisabled={props.isDisabled}
          className={clsx("react-aria-Group", styles.field, utils.inset)}
        >
          <Input
            ref={inputRef}
            className={clsx("react-aria-Input", styles.fieldInput)}
            placeholder={placeholder}
          />
          {button}
        </Group>
      ) : (
        <Input
          ref={inputRef}
          className={clsx("react-aria-Input", styles.input, utils.inset)}
          placeholder={placeholder}
        />
      )}
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
