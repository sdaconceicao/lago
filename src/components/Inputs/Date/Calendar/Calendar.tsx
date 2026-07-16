"use client";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  type CalendarProps as AriaCalendarProps,
  type CalendarCellProps,
  type CalendarGridProps,
  CalendarHeading,
  type DateValue,
} from "react-aria-components/Calendar";
import { Button } from "@/components/Actions/Button/Button";
import { Text } from "@/components/Typography/index";
import utils from "@/styles/utilities.module.css";
import styles from "./Calendar.module.css";

export interface CalendarProps<
  T extends DateValue,
> extends AriaCalendarProps<T> {
  errorMessage?: string;
}

export function Calendar<T extends DateValue>({
  errorMessage,
  ...props
}: CalendarProps<T>) {
  const months = props.visibleDuration?.months || 1;
  return (
    <AriaCalendar
      {...props}
      className={
        props.className ?? clsx("react-aria-Calendar", styles.calendar)
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
            <CalendarGrid offset={{ months: i }}>
              {(date) => <CalendarCell date={date} />}
            </CalendarGrid>
          </div>
        ))}
      </div>
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
    </AriaCalendar>
  );
}

export function CalendarCell(props: CalendarCellProps) {
  return (
    <AriaCalendarCell
      {...props}
      className={clsx(
        "react-aria-CalendarCell",
        styles.calendarCell,
        utils.buttonBase
      )}
      data-variant="quiet"
    />
  );
}

export function CalendarGrid(props: CalendarGridProps) {
  return (
    <AriaCalendarGrid
      {...props}
      className={
        props.className ?? clsx("react-aria-CalendarGrid", styles.calendarGrid)
      }
    />
  );
}
