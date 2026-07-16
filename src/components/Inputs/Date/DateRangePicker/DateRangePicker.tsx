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
  Description,
  FieldButton,
  FieldError,
  Label,
} from "@/components/Inputs/Form/index";
import { Popover } from "@/components/Popover/Popover";
import utils from "@/styles/utilities.module.css";
import styles from "./DateRangePicker.module.css";

export interface DateRangePickerProps<
  T extends DateValue,
> extends AriaDateRangePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DateRangePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  ...props
}: DateRangePickerProps<T>) {
  return (
    <AriaDateRangePicker
      {...props}
      className={
        props.className ??
        clsx("react-aria-DateRangePicker", styles.dateRangePicker)
      }
    >
      <Label isRequired={props.isRequired}>{label}</Label>
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
