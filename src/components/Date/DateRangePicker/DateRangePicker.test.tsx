import { CalendarDate } from "@internationalized/date";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateRangePicker } from "./DateRangePicker";

const RANGE = {
  start: new CalendarDate(2024, 6, 10),
  end: new CalendarDate(2024, 6, 15),
};

describe("DateRangePicker", () => {
  it("renders a label, start and end segments, and a trigger button", () => {
    render(<DateRangePicker label="Event dates" />);

    expect(screen.getByText("Event dates")).toBeInTheDocument();
    // month/day/year segments for both the start and end dates
    expect(screen.getAllByRole("spinbutton")).toHaveLength(6);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows the default range in its segments", () => {
    render(<DateRangePicker label="Event dates" defaultValue={RANGE} />);

    const values = screen
      .getAllByRole("spinbutton")
      .map((segment) => segment.getAttribute("aria-valuenow"));
    expect(values).toEqual(["6", "10", "2024", "6", "15", "2024"]);
  });

  it("opens the range calendar popover from the trigger button", async () => {
    const user = userEvent.setup();
    render(<DateRangePicker label="Event dates" defaultValue={RANGE} />);

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button"));

    expect(await screen.findByRole("grid")).toBeInTheDocument();
    // the popover renders a visually-hidden title alongside the
    // visible calendar heading
    expect(screen.getAllByText("June 2024").length).toBeGreaterThan(0);
  });

  it("selects a range from the popover and closes it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        label="Event dates"
        defaultValue={RANGE}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("button"));
    await screen.findByRole("grid");
    await user.click(screen.getByText("18"));
    await user.click(screen.getByText("22"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0][0];
    expect(range.start.toString()).toBe("2024-06-18");
    expect(range.end.toString()).toBe("2024-06-22");

    await waitFor(() =>
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    );
  });

  it("supports keyboard entry through the start segments", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        label="Event dates"
        defaultValue={RANGE}
        onChange={onChange}
      />
    );

    // focus the start day segment and decrement it
    await user.click(screen.getAllByRole("spinbutton")[1]);
    await user.keyboard("{ArrowDown}");

    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.lastCall?.[0];
    expect(range.start.toString()).toBe("2024-06-09");
    expect(range.end.toString()).toBe("2024-06-15");
  });

  it("renders a description", () => {
    render(
      <DateRangePicker label="Event dates" description="Choose a range" />
    );

    expect(screen.getByText("Choose a range")).toBeInTheDocument();
  });

  it("shows an error message when invalid", () => {
    render(
      <DateRangePicker
        label="Event dates"
        isInvalid
        errorMessage="Range is required"
      />
    );

    expect(screen.getByText("Range is required")).toBeInTheDocument();
  });

  it("disables the trigger button when isDisabled", () => {
    render(<DateRangePicker label="Event dates" isDisabled />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
