"use client";
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
import { Description, FieldError, Label } from "../../Form/Form";
import "./DateField.css";

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
    <AriaDateField {...props}>
      <Label>{label}</Label>
      <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaDateField>
  );
}

export function DateSegment(props: DateSegmentProps) {
  return <AriaDateSegment {...props} />;
}

export function DateInput(props: DateInputProps) {
  return <AriaDateInput {...props} className="react-aria-DateInput inset" />;
}
