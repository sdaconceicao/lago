import { CalendarDate } from "@internationalized/date";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "./Calendar";

const JUNE_15 = new CalendarDate(2024, 6, 15);

describe("Calendar", () => {
  it("renders a grid labelled by the calendar", () => {
    render(<Calendar aria-label="Event date" defaultValue={JUNE_15} />);

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAccessibleName(/Event date/i);
  });

  it("shows the heading for the current month", () => {
    render(<Calendar aria-label="Event date" defaultValue={JUNE_15} />);

    expect(screen.getByText("June 2024")).toBeInTheDocument();
  });

  it("marks the default value as selected", () => {
    render(<Calendar aria-label="Event date" defaultValue={JUNE_15} />);

    expect(screen.getByLabelText(/June 15, 2024/)).toHaveAttribute(
      "data-selected"
    );
  });

  it("calls onChange with the clicked date", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Calendar
        aria-label="Event date"
        defaultValue={JUNE_15}
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("20"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].toString()).toBe("2024-06-20");
  });

  it("navigates to the next and previous months", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Calendar aria-label="Event date" defaultValue={JUNE_15} />
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

  it("disables dates outside minValue and maxValue", () => {
    render(
      <Calendar
        aria-label="Event date"
        defaultValue={JUNE_15}
        minValue={new CalendarDate(2024, 6, 10)}
        maxValue={new CalendarDate(2024, 6, 20)}
      />
    );

    expect(screen.getByLabelText(/June 5, 2024/)).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.getByLabelText(/June 25, 2024/)).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.getByLabelText(/June 15, 2024/)).not.toHaveAttribute(
      "aria-disabled"
    );
  });

  it("does not call onChange when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Calendar
        aria-label="Event date"
        defaultValue={JUNE_15}
        isDisabled
        onChange={onChange}
      />
    );

    await user.click(screen.getByText("20"));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders an error message", () => {
    render(
      <Calendar
        aria-label="Event date"
        defaultValue={JUNE_15}
        isInvalid
        errorMessage="Selection is invalid"
      />
    );

    expect(screen.getByText("Selection is invalid")).toBeInTheDocument();
  });

  it("renders multiple months when visibleDuration is set", () => {
    const { container } = render(
      <Calendar
        aria-label="Event date"
        defaultValue={JUNE_15}
        visibleDuration={{ months: 2 }}
      />
    );

    const calendar = within(container);
    expect(calendar.getAllByRole("grid")).toHaveLength(2);
    expect(calendar.getByText("June 2024")).toBeInTheDocument();
    expect(calendar.getByText("July 2024")).toBeInTheDocument();
  });
});
