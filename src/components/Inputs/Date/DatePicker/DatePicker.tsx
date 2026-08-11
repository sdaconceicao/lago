"use client";
import clsx from "clsx";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  DatePicker as AriaDatePicker,
  type DatePickerProps as AriaDatePickerProps,
  DatePickerStateContext,
  type DateValue,
  type ValidationResult,
} from "react-aria-components/DatePicker";
import { Calendar } from "@/components/Inputs/Date/Calendar/Calendar";
import {
  DateInput,
  DateSegment,
} from "@/components/Inputs/Date/DateField/DateField";
import { FieldGroup } from "@/components/Inputs/Date/FieldGroup";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldButton,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import { Popover } from "@/components/Overlays/Popover/Popover";
import base from "@/styles/base.module.css";
import styles from "./DatePicker.module.css";

export interface DatePickerProps<T extends DateValue>
  extends AriaDatePickerProps<T> {
  /** Accessible label rendered above the field. */
  label?: string;
  /** Helper text rendered below the field. */
  description?: string;
  /** Error message shown when the field is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Field size: 28px, 36px (default), or 48px tall. The calendar popover does not scale. */
  size?: FieldSize;
}

/**
 * A date field combined with a calendar popover, so a date can be typed or
 * picked visually. Its field sizing and padding match the TextField and Select
 * fields so the controls align when placed side by side.
 */
export function DatePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  size = DEFAULT_FIELD_SIZE,
  ...props
}: DatePickerProps<T>) {
  return (
    <AriaDatePicker
      {...props}
      data-field-size={size}
      className={
        props.className ?? clsx("react-aria-DatePicker", styles.datePicker)
      }
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      <FieldGroup
        stateContext={DatePickerStateContext}
        className={clsx("react-aria-Group", styles.group, base.inset)}
      >
        <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
        <FieldButton>
          <CalendarIcon />
        </FieldButton>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow>
        <Calendar />
      </Popover>
    </AriaDatePicker>
  );
}
