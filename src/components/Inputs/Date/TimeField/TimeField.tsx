"use client";
import clsx from "clsx";
import {
  TimeField as AriaTimeField,
  type TimeFieldProps as AriaTimeFieldProps,
  type TimeValue,
  type ValidationResult,
} from "react-aria-components/TimeField";
import {
  DateInput,
  DateSegment,
} from "@/components/Inputs/Date/DateField/DateField";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import styles from "./TimeField.module.css";

export interface TimeFieldProps<T extends TimeValue>
  extends AriaTimeFieldProps<T> {
  /** Accessible label rendered above the field. */
  label?: string;
  /** Helper text rendered below the field. */
  description?: string;
  /** Error message shown when the field is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /**
   * The size of the field. `"sm"` renders a compact 28px-tall control and
   * `"md"` (the default) a 48px-tall one. Fields of the same size share their
   * height, border radius, horizontal padding, and font size, so they line up
   * when placed in a row.
   */
  size?: FieldSize;
}

/**
 * A time input made of individually editable segments (hour, minute, day
 * period) that can be typed or stepped with the arrow keys. It shares the
 * DateField surface, so it lines up with the other fields of the same size.
 */
export function TimeField<T extends TimeValue>({
  label,
  description,
  errorMessage,
  size = DEFAULT_FIELD_SIZE,
  ...props
}: TimeFieldProps<T>) {
  return (
    <AriaTimeField
      {...props}
      data-field-size={size}
      className={
        props.className ?? clsx("react-aria-TimeField", styles.timeField)
      }
    >
      <Label isRequired={props.isRequired}>{label}</Label>
      <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTimeField>
  );
}
