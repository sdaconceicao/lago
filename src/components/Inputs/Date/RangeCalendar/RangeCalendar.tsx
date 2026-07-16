"use client";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  CalendarCell as AriaCalendarCell,
  RangeCalendar as AriaRangeCalendar,
  type RangeCalendarProps as AriaRangeCalendarProps,
  type CalendarCellProps,
  CalendarHeading,
  type DateValue,
  Text,
} from "react-aria-components/RangeCalendar";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { Button } from "@/components/Button/Button";
import { CalendarGrid } from "@/components/Inputs/Date/Calendar/Calendar";
import utils from "@/styles/utilities.module.css";
import calendarStyles from "@/components/Inputs/Date/Calendar/Calendar.module.css";
import styles from "./RangeCalendar.module.css";

export interface RangeCalendarProps<
  T extends DateValue,
> extends AriaRangeCalendarProps<T> {
  errorMessage?: string;
}

export function RangeCalendar<T extends DateValue>({
  errorMessage,
  ...props
}: RangeCalendarProps<T>) {
  const months = props.visibleDuration?.months || 1;
  return (
    <AriaRangeCalendar
      {...props}
      className={
        props.className ??
        clsx("react-aria-RangeCalendar", styles.rangeCalendar)
      }
    >
      <div className={clsx("months", styles.months)}>
        {Array.from({ length: months }, (_, i) => (
          <div key={i} className={clsx("month", styles.month)}>
            <header>
              {i === 0 && (
                <Button slot="previous" variant="quiet">
                  <ChevronLeft />
                </Button>
              )}
              <CalendarHeading
                offset={{ months: i }}
                className={clsx(
                  "react-aria-CalendarHeading",
                  styles.calendarHeading
                )}
              />
              {i === months - 1 && (
                <Button slot="next" variant="quiet">
                  <ChevronRight />
                </Button>
              )}
            </header>
            <CalendarGrid
              offset={{ months: i }}
              className={clsx("react-aria-CalendarGrid", styles.calendarGrid)}
            >
              {(date) => <CalendarCell date={date} />}
            </CalendarGrid>
          </div>
        ))}
      </div>
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
    </AriaRangeCalendar>
  );
}

export { CalendarGrid };
export function CalendarCell(props: CalendarCellProps) {
  return (
    <AriaCalendarCell
      {...props}
      className={
        props.className ??
        clsx(
          "react-aria-CalendarCell",
          calendarStyles.calendarCell,
          styles.calendarCell
        )
      }
    >
      {composeRenderProps(
        props.children,
        (
          children,
          {
            defaultChildren,
            isHovered,
            isPressed,
            isSelectionStart,
            isSelectionEnd,
            isDisabled,
          }
        ) => (
          <span
            className={utils.buttonBase}
            data-variant="quiet"
            data-hovered={isHovered || undefined}
            data-pressed={isPressed || undefined}
            data-selected={isSelectionStart || isSelectionEnd || undefined}
            data-disabled={isDisabled || undefined}
          >
            {children || defaultChildren}
          </span>
        )
      )}
    </AriaCalendarCell>
  );
}
