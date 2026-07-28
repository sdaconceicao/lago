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
import utils from "@/styles/utilities.module.css";
import styles from "./DateField.module.css";

export interface DateFieldProps<T extends DateValue>
  extends AriaDateFieldProps<T> {
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
