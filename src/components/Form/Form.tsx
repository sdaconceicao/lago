"use client";
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
import "./Form.css";

export function Form(props: FormProps) {
  return <RACForm {...props} />;
}

export function Label(props: LabelProps) {
  return <RACLabel {...props} />;
}

export function FieldError(props: FieldErrorProps) {
  return <RACFieldError {...props} />;
}

export function Description(props: TextProps) {
  return <Text slot="description" className="field-description" {...props} />;
}

export function FieldButton(props: ButtonProps) {
  return <Button {...props} className="field-Button" />;
}
