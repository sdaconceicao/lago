"use client";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import {
  CalendarCell as AriaCalendarCell,
  RangeCalendar as AriaRangeCalendar,
  type RangeCalendarProps as AriaRangeCalendarProps,
  type CalendarCellProps,
  CalendarHeading,
  type DateValue,
  Text,
} from "react-aria-components/RangeCalendar";
import { IconButton } from "@/components/Actions/IconButton/IconButton";
import { CalendarGrid } from "@/components/Inputs/Date/Calendar/Calendar";
import calendarStyles from "@/components/Inputs/Date/Calendar/Calendar.module.css";
import base from "@/styles/base.module.css";
import styles from "./RangeCalendar.module.css";

export interface RangeCalendarProps<T extends DateValue>
  extends AriaRangeCalendarProps<T> {
  errorMessage?: string;
}

export function RangeCalendar<T extends DateValue>({
  errorMessage,
  ...props
}: RangeCalendarProps<T>) {
  const months = props.visibleDuration?.months || 1;
  const monthKeys = Array.from(
    { length: months },
    (_, monthOffset) => `month-${monthOffset}`
  );

  return (
    <AriaRangeCalendar
      {...props}
      className={clsx(
        "react-aria-RangeCalendar",
        styles.rangeCalendar,
        props.className
      )}
    >
      <div className={clsx("months", styles.months)}>
        {monthKeys.map((monthKey, monthOffset) => (
          <div key={monthKey} className={clsx("month", styles.month)}>
            <header>
              {monthOffset === 0 && (
                <IconButton slot="previous" variant="quiet">
                  <ChevronLeft />
                </IconButton>
              )}
              <CalendarHeading
                offset={{ months: monthOffset }}
                className={clsx(
                  "react-aria-CalendarHeading",
                  styles.calendarHeading
                )}
              />
              {monthOffset === months - 1 && (
                <IconButton slot="next" variant="quiet">
                  <ChevronRight />
                </IconButton>
              )}
            </header>
            <CalendarGrid
              offset={{ months: monthOffset }}
              className={clsx("react-aria-CalendarGrid", styles.calendarGrid)}
            >
              {(date) => <RangeCalendarCell date={date} />}
            </CalendarGrid>
          </div>
        ))}
      </div>
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
    </AriaRangeCalendar>
  );
}

/**
 * The day cell for a RangeCalendar. Layers range-selection styling (start, end,
 * and in-between days) over the single-date Calendar's cell, and is named for
 * its owner so it does not collide with `CalendarCell` at the entry point.
 */
export function RangeCalendarCell(props: CalendarCellProps) {
  return (
    <AriaCalendarCell
      {...props}
      className={clsx(
        "react-aria-CalendarCell",
        calendarStyles.calendarCell,
        styles.calendarCell,
        props.className
      )}
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
            className={base.buttonBase}
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
