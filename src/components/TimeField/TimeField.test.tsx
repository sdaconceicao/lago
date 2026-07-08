import { Time } from "@internationalized/date";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimeField } from "./TimeField";

describe("TimeField", () => {
  it("renders a labelled group of time segments", () => {
    render(<TimeField label="Event time" />);

    expect(
      screen.getByRole("group", { name: "Event time" })
    ).toBeInTheDocument();
    // hour, minute, and AM/PM segments in the default 12-hour locale
    expect(screen.getAllByRole("spinbutton")).toHaveLength(3);
  });

  it("shows the default value in its segments", () => {
    render(<TimeField label="Event time" defaultValue={new Time(11, 45)} />);

    const [hour, minute] = screen.getAllByRole("spinbutton");
    expect(hour).toHaveAttribute("aria-valuenow", "11");
    expect(minute).toHaveAttribute("aria-valuenow", "45");
  });

  it("renders two segments with a 24-hour cycle", () => {
    render(
      <TimeField
        label="Event time"
        defaultValue={new Time(13, 30)}
        hourCycle={24}
      />
    );

    const segments = screen.getAllByRole("spinbutton");
    expect(segments).toHaveLength(2);
    expect(segments[0]).toHaveAttribute("aria-valuenow", "13");
  });

  it("calls onChange with the typed time", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeField label="Event time" onChange={onChange} />);

    await user.click(screen.getAllByRole("spinbutton")[0]);
    await user.keyboard("1130PM");

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.lastCall?.[0].toString()).toBe("23:30:00");
  });

  it("increments the minute with the arrow keys", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimeField
        label="Event time"
        defaultValue={new Time(11, 45)}
        onChange={onChange}
      />
    );

    await user.click(screen.getAllByRole("spinbutton")[1]);
    await user.keyboard("{ArrowUp}");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.lastCall?.[0].toString()).toBe("11:46:00");
  });

  it("renders a description", () => {
    render(<TimeField label="Event time" description="Local time" />);

    expect(screen.getByText("Local time")).toBeInTheDocument();
  });

  it("shows an error message when invalid", () => {
    render(
      <TimeField label="Event time" isInvalid errorMessage="Time is required" />
    );

    expect(screen.getByText("Time is required")).toBeInTheDocument();
  });

  it("ignores keyboard input when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimeField
        label="Event time"
        defaultValue={new Time(11, 45)}
        isDisabled
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("group", { name: "Event time" }));
    await user.keyboard("{ArrowUp}");

    expect(onChange).not.toHaveBeenCalled();
  });
});
