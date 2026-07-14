"use client";
import clsx from "clsx";
import { Button, type ButtonProps } from "react-aria-components/Button";
import {
  type FieldErrorProps,
  FieldError as RACFieldError,
} from "react-aria-components/FieldError";
import { type FormProps, Form as RACForm } from "react-aria-components/Form";
import {
  type LabelProps,
  Label as RACLabel,
} from "react-aria-components/Label";
import { type TextProps } from "react-aria-components/Text";
import { Text } from "../Content/Content";
import styles from "./Form.module.css";

export function Form(props: FormProps) {
  return (
    <RACForm
      {...props}
      className={clsx("react-aria-Form", styles.form, props.className)}
    />
  );
}

export function Label(props: LabelProps) {
  return (
    <RACLabel
      {...props}
      className={clsx("react-aria-Label", styles.label, props.className)}
    />
  );
}

export function FieldError(props: FieldErrorProps) {
  return (
    <RACFieldError
      {...props}
      className={clsx(
        "react-aria-FieldError",
        styles.fieldError,
        props.className
      )}
    />
  );
}

export function Description(props: TextProps) {
  return (
    <Text
      slot="description"
      className={clsx(
        "field-description",
        styles.fieldDescription,
        props.className
      )}
      {...props}
    />
  );
}

export function FieldButton(props: ButtonProps) {
  return (
    <Button
      {...props}
      className={clsx("field-Button", styles.fieldButton, props.className)}
    />
  );
}
