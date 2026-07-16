"use client";
import type React from "react";
import clsx from "clsx";
import {
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  Input,
  type ValidationResult,
} from "react-aria-components/TextField";
import { Description, FieldError, Label } from "@/components/Inputs/Form/index";
import utils from "@/styles/utilities.module.css";
import styles from "./TextField.module.css";

export interface TextFieldProps<
  T = HTMLInputElement,
> extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
  inputRef?: React.Ref<T>;
}

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  inputRef,
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
      <Input
        ref={inputRef}
        className={clsx("react-aria-Input", styles.input, utils.inset)}
        placeholder={placeholder}
      />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}

export function TextArea({
  label,
  description,
  errorMessage,
  placeholder,
  inputRef,
  ...props
}: TextFieldProps<HTMLTextAreaElement>) {
  return (
    <AriaTextField
      {...props}
      className={clsx(
        "react-aria-TextField",
        styles.textField,
        props.className
      )}
    >
      <Label isRequired={props.isRequired}>{label}</Label>
      <AriaTextArea
        ref={inputRef}
        className={clsx("react-aria-TextArea", styles.textArea, utils.inset)}
        placeholder={placeholder}
      />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
