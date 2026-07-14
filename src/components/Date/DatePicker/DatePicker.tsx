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
import { Description, FieldButton, FieldError, Label } from "../../Form/Form";
import { Popover } from "../../Popover/Popover";
import { Calendar } from "../Calendar/Calendar";
import { DateInput, DateSegment } from "../DateField/DateField";
import { FieldGroup } from "../FieldGroup";
import utils from "../../../styles/utilities.module.css";
import styles from "./DatePicker.module.css";

export interface DatePickerProps<
  T extends DateValue,
> extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function DatePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  ...props
}: DatePickerProps<T>) {
  return (
    <AriaDatePicker
      {...props}
      className={
        props.className ?? clsx("react-aria-DatePicker", styles.datePicker)
      }
    >
      <Label>{label}</Label>
      <FieldGroup
        stateContext={DatePickerStateContext}
        className={clsx("react-aria-Group", styles.group, utils.inset)}
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
