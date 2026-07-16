"use client";
import clsx from "clsx";
import {
  DateField as AriaDateField,
  type DateFieldProps as AriaDateFieldProps,
  DateInput as AriaDateInput,
  DateSegment as AriaDateSegment,
  type DateInputProps,
  type DateSegmentProps,
  type DateValue,
  type ValidationResult,
} from "react-aria-components/DateField";
import { Description, FieldError, Label } from "@/components/Inputs/Form/index";
import utils from "@/styles/utilities.module.css";
import styles from "./DateField.module.css";

export interface DateFieldProps<
  T extends DateValue,
> extends AriaDateFieldProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateField<T extends DateValue>({
  label,
  description,
  errorMessage,
  ...props
}: DateFieldProps<T>) {
  return (
    <AriaDateField
      {...props}
      className={
        props.className ?? clsx("react-aria-DateField", styles.dateField)
      }
    >
      <Label isRequired={props.isRequired}>{label}</Label>
      <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaDateField>
  );
}

export function DateSegment(props: DateSegmentProps) {
  return (
    <AriaDateSegment
      {...props}
      className={
        props.className ?? clsx("react-aria-DateSegment", styles.dateSegment)
      }
    />
  );
}

export function DateInput(props: DateInputProps) {
  return (
    <AriaDateInput
      {...props}
      className={clsx("react-aria-DateInput", styles.dateInput, utils.inset)}
    />
  );
}
