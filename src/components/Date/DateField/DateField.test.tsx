import { CalendarDate } from "@internationalized/date";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateField } from "./DateField";

const JUNE_15 = new CalendarDate(2024, 6, 15);

describe("DateField", () => {
  it("renders a labelled group of date segments", () => {
    render(<DateField label="Event date" />);

    expect(
      screen.getByRole("group", { name: "Event date" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("spinbutton")).toHaveLength(3);
  });

  it("shows the default value in its segments", () => {
    render(<DateField label="Event date" defaultValue={JUNE_15} />);

    const [month, day, year] = screen.getAllByRole("spinbutton");
    expect(month).toHaveAttribute("aria-valuenow", "6");
    expect(day).toHaveAttribute("aria-valuenow", "15");
    expect(year).toHaveAttribute("aria-valuenow", "2024");
  });

  it("calls onChange with the typed date", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateField label="Event date" onChange={onChange} />);

    await user.click(screen.getAllByRole("spinbutton")[0]);
    await user.keyboard("2141990");

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.lastCall?.[0].toString()).toBe("1990-02-14");
  });

  it("increments a segment with the arrow keys", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateField
        label="Event date"
        defaultValue={JUNE_15}
        onChange={onChange}
      />
    );

    await user.click(screen.getAllByRole("spinbutton")[0]);
    await user.keyboard("{ArrowUp}");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.lastCall?.[0].toString()).toBe("2024-07-15");
  });

  it("renders a description", () => {
    render(<DateField label="Event date" description="Choose a start date" />);

    expect(screen.getByText("Choose a start date")).toBeInTheDocument();
  });

  it("shows an error message when invalid", () => {
    render(
      <DateField label="Event date" isInvalid errorMessage="Date is required" />
    );

    expect(screen.getByText("Date is required")).toBeInTheDocument();
  });

  it("ignores keyboard input when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateField
        label="Event date"
        defaultValue={JUNE_15}
        isDisabled
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("group", { name: "Event date" }));
    await user.keyboard("{ArrowUp}");

    expect(onChange).not.toHaveBeenCalled();
  });

  it("marks segments as read-only when isReadOnly", () => {
    render(<DateField label="Event date" defaultValue={JUNE_15} isReadOnly />);

    for (const segment of screen.getAllByRole("spinbutton")) {
      expect(segment).toHaveAttribute("aria-readonly", "true");
    }
  });
});
