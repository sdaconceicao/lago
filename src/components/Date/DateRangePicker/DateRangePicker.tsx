"use client";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  DateRangePicker as AriaDateRangePicker,
  type DateRangePickerProps as AriaDateRangePickerProps,
  DateRangePickerStateContext,
  type DateValue,
  type ValidationResult,
} from "react-aria-components/DateRangePicker";
import { Description, FieldButton, FieldError, Label } from "../../Form/Form";
import { Popover } from "../../Popover/Popover";
import { DateInput, DateSegment } from "../DateField/DateField";
import { FieldGroup } from "../FieldGroup";
import { RangeCalendar } from "../RangeCalendar/RangeCalendar";
import "./DateRangePicker.css";

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
    <AriaDateRangePicker {...props}>
      <Label>{label}</Label>
      <FieldGroup
        stateContext={DateRangePickerStateContext}
        className="react-aria-Group inset"
      >
        <div className="date-fields">
          <DateInput slot="start">
            {(segment) => <DateSegment segment={segment} />}
          </DateInput>
          <span aria-hidden="true" className="date-range-separator">
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
