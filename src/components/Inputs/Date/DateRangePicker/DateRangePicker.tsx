"use client";
import clsx from "clsx";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  DateRangePicker as AriaDateRangePicker,
  type DateRangePickerProps as AriaDateRangePickerProps,
  DateRangePickerStateContext,
  type DateValue,
  type ValidationResult,
} from "react-aria-components/DateRangePicker";
import {
  DateInput,
  DateSegment,
} from "@/components/Inputs/Date/DateField/DateField";
import { FieldGroup } from "@/components/Inputs/Date/FieldGroup";
import { RangeCalendar } from "@/components/Inputs/Date/RangeCalendar/RangeCalendar";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldButton,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import { Popover } from "@/components/Overlays/Popover/Popover";
import utils from "@/styles/utilities.module.css";
import styles from "./DateRangePicker.module.css";

export interface DateRangePickerProps<T extends DateValue>
  extends AriaDateRangePickerProps<T> {
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
 * A pair of date fields combined with a range calendar popover, so a start and
 * end date can be typed or picked visually. Its field sizing and padding match
 * the TextField and Select fields so the controls align when placed side by
 * side.
 */
export function DateRangePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  size = DEFAULT_FIELD_SIZE,
  ...props
}: DateRangePickerProps<T>) {
  return (
    <AriaDateRangePicker
      {...props}
      data-field-size={size}
      className={clsx(
        "react-aria-DateRangePicker",
        styles.dateRangePicker,
        props.className
      )}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      <FieldGroup
        stateContext={DateRangePickerStateContext}
        className={clsx("react-aria-Group", styles.group, utils.inset)}
      >
        <div className={clsx("date-fields", styles.dateFields)}>
          <DateInput slot="start">
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
          <span
            aria-hidden="true"
            className={clsx("date-range-separator", styles.dateRangeSeparator)}
          >
            –
          </span>
          <DateInput slot="end">
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
        </div>
        <FieldButton>
          <CalendarIcon />
        </FieldButton>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow>
        <RangeCalendar />
      </Popover>
    </AriaDateRangePicker>
  );
}
