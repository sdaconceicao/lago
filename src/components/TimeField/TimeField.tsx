"use client";
import clsx from "clsx";
import {
  TimeField as AriaTimeField,
  type TimeFieldProps as AriaTimeFieldProps,
  type TimeValue,
  type ValidationResult,
} from "react-aria-components/TimeField";
import { DateInput, DateSegment } from "../Date/DateField/DateField";
import { Description, FieldError, Label } from "../Form/Form";
import styles from "./TimeField.module.css";

export interface TimeFieldProps<
  T extends TimeValue,
> extends AriaTimeFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function TimeField<T extends TimeValue>({
  label,
  description,
  errorMessage,
  ...props
}: TimeFieldProps<T>) {
  return (
    <AriaTimeField
      {...props}
      className={
        props.className ?? clsx("react-aria-TimeField", styles.timeField)
      }
    >
      <Label>{label}</Label>
      <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTimeField>
  );
}
