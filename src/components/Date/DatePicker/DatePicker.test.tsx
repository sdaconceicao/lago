import { CalendarDate } from "@internationalized/date";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "./DatePicker";

const JUNE_15 = new CalendarDate(2024, 6, 15);

describe("DatePicker", () => {
  it("renders a label, date segments, and a trigger button", () => {
    render(<DatePicker label="Event date" />);

    expect(screen.getByText("Event date")).toBeInTheDocument();
    expect(screen.getAllByRole("spinbutton")).toHaveLength(3);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows the default value in its segments", () => {
    render(<DatePicker label="Event date" defaultValue={JUNE_15} />);

    const [month, day, year] = screen.getAllByRole("spinbutton");
    expect(month).toHaveAttribute("aria-valuenow", "6");
    expect(day).toHaveAttribute("aria-valuenow", "15");
    expect(year).toHaveAttribute("aria-valuenow", "2024");
  });

  it("opens the calendar popover from the trigger button", async () => {
    const user = userEvent.setup();
    render(<DatePicker label="Event date" defaultValue={JUNE_15} />);

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button"));

    expect(await screen.findByRole("grid")).toBeInTheDocument();
    // the popover renders a visually-hidden title alongside the
    // visible calendar heading
    expect(screen.getAllByText("June 2024").length).toBeGreaterThan(0);
  });

  it("selects a date from the popover and closes it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        label="Event date"
        defaultValue={JUNE_15}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("button"));
    await screen.findByRole("grid");
    await user.click(screen.getByText("20"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].toString()).toBe("2024-06-20");

    await waitFor(() =>
      expect(screen.queryByRole("grid")).not.toBeInTheDocument()
    );

    const [month, day, year] = screen.getAllByRole("spinbutton");
    expect(month).toHaveAttribute("aria-valuenow", "6");
    expect(day).toHaveAttribute("aria-valuenow", "20");
    expect(year).toHaveAttribute("aria-valuenow", "2024");
  });

  it("supports keyboard entry through the segments", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker label="Event date" onChange={onChange} />);

    await user.click(screen.getAllByRole("spinbutton")[0]);
    await user.keyboard("2141990");

    expect(onChange.mock.lastCall?.[0].toString()).toBe("1990-02-14");
  });

  it("renders a description", () => {
    render(<DatePicker label="Event date" description="Choose a date" />);

    expect(screen.getByText("Choose a date")).toBeInTheDocument();
  });

  it("shows an error message when invalid", () => {
    render(
      <DatePicker
        label="Event date"
        isInvalid
        errorMessage="Date is required"
      />
    );

    expect(screen.getByText("Date is required")).toBeInTheDocument();
  });

  it("disables the trigger button when isDisabled", () => {
    render(<DatePicker label="Event date" isDisabled />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
