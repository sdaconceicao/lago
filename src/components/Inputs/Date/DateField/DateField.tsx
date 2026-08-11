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
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import base from "@/styles/base.module.css";
import styles from "./DateField.module.css";

export interface DateFieldProps<T extends DateValue>
  extends AriaDateFieldProps<T> {
  /** Accessible label rendered above the field. */
  label?: string;
  /** Helper text rendered below the field. */
  description?: string;
  /** Error message shown when the field is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Field size: 28px, 36px (default), or 48px tall. */
  size?: FieldSize;
}

/**
 * A date input made of individually editable segments (month, day, year) that
 * can be typed or stepped with the arrow keys. Its field sizing and padding
 * match the TextField, Select, and DatePicker fields so the controls align when
 * placed side by side.
 */
export function DateField<T extends DateValue>({
  label,
  description,
  errorMessage,
  size = DEFAULT_FIELD_SIZE,
  ...props
}: DateFieldProps<T>) {
  return (
    <AriaDateField
      {...props}
      data-field-size={size}
      className={
        props.className ?? clsx("react-aria-DateField", styles.dateField)
      }
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
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
      className={clsx("react-aria-DateInput", styles.dateInput, base.inset)}
    />
  );
}
