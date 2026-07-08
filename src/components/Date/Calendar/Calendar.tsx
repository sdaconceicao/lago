"use client";
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
import { Button } from "../../Button/Button";
import { Text } from "../../Content/Content";
import "./Calendar.css";

export interface CalendarProps<
  T extends DateValue,
> extends AriaCalendarProps<T> {
  errorMessage?: string;
}

export function Calendar<T extends DateValue>({
  errorMessage,
  ...props
}: CalendarProps<T>) {
  let months = props.visibleDuration?.months || 1;
  return (
    <AriaCalendar {...props}>
      <div className="months">
        {Array.from({ length: months }, (_, i) => (
          <div key={i} className="month">
            <header>
              {i === 0 && (
                <Button slot="previous" variant="quiet">
                  <ChevronLeft />
                </Button>
              )}
              <CalendarHeading offset={{ months: i }} />
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
      className="react-aria-CalendarCell button-base"
      data-variant="quiet"
    />
  );
}

export function CalendarGrid(props: CalendarGridProps) {
  return <AriaCalendarGrid {...props} />;
}
