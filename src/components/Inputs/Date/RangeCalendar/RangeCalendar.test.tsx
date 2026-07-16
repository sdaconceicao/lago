import { CalendarDate } from "@internationalized/date";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RangeCalendar } from "./RangeCalendar";

const RANGE = {
  start: new CalendarDate(2024, 6, 10),
  end: new CalendarDate(2024, 6, 15),
};

describe("RangeCalendar", () => {
  it("renders a grid labelled by the calendar", () => {
    render(<RangeCalendar aria-label="Trip dates" defaultValue={RANGE} />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAccessibleName(/Trip dates/i);
  });

  it("shows the heading for the current month", () => {
    render(<RangeCalendar aria-label="Trip dates" defaultValue={RANGE} />);

    expect(screen.getByText("June 2024")).toBeInTheDocument();
  });

  it("marks the range start and end cells as selected", () => {
    render(<RangeCalendar aria-label="Trip dates" defaultValue={RANGE} />);

    expect(screen.getByText("10")).toHaveAttribute("data-selected");
    expect(screen.getByText("15")).toHaveAttribute("data-selected");
    // dates inside the range are selected on the cell, but not styled
    // as the start/end caps
    expect(screen.getByText("12")).not.toHaveAttribute("data-selected");
    expect(screen.getByText("12").closest("div")).toHaveAttribute(
      "data-selected"
    );
  });

  it("selects a range by clicking a start and end date", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RangeCalendar
        aria-label="Trip dates"
        defaultFocusedValue={new CalendarDate(2024, 6, 1)}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("10"));
    await user.click(screen.getByText("15"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0][0];
    expect(range.start.toString()).toBe("2024-06-10");
    expect(range.end.toString()).toBe("2024-06-15");
  });

  it("navigates to the next and previous months", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RangeCalendar aria-label="Trip dates" defaultValue={RANGE} />
    );

    // react-aria adds extra visually-hidden nav buttons and a live
    // announcer in document.body, so scope queries to the component
    const calendar = within(container);
    const header = within(container.querySelector("header") as HTMLElement);

    await user.click(header.getByRole("button", { name: /next/i }));
    expect(calendar.getByText("July 2024")).toBeInTheDocument();

    await user.click(header.getByRole("button", { name: /previous/i }));
    expect(calendar.getByText("June 2024")).toBeInTheDocument();
  });

  it("disables dates before minValue", () => {
    render(
      <RangeCalendar
        aria-label="Trip dates"
        defaultValue={RANGE}
        minValue={new CalendarDate(2024, 6, 8)}
      />
    );

    expect(screen.getByLabelText(/June 5, 2024/)).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  it("does not call onChange when read-only", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RangeCalendar
        aria-label="Trip dates"
        defaultValue={RANGE}
        isReadOnly
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("20"));
    await user.click(screen.getByText("25"));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders an error message", () => {
    render(
      <RangeCalendar
        aria-label="Trip dates"
        defaultValue={RANGE}
        isInvalid
        errorMessage="Range is invalid"
      />
    );

    expect(screen.getByText("Range is invalid")).toBeInTheDocument();
  });
});
