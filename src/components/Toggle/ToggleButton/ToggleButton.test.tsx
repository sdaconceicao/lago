import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleButton } from "./ToggleButton";

describe("ToggleButton", () => {
  it("renders a button with its children wrapped in a span", () => {
    render(<ToggleButton>Pin</ToggleButton>);

    const button = screen.getByRole("button", { name: "Pin" });
    expect(button).toBeInTheDocument();
    expect(button.querySelector("span")).toHaveTextContent("Pin");
  });

  it("is unselected by default", () => {
    render(<ToggleButton>Pin</ToggleButton>);

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles selection on click and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleButton onChange={onChange}>Pin</ToggleButton>);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(onChange).toHaveBeenLastCalledWith(true);

    await user.click(button);

    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("respects defaultSelected for uncontrolled usage", () => {
    render(<ToggleButton defaultSelected>Pin</ToggleButton>);

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("stays in the controlled isSelected state after a click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleButton isSelected={false} onChange={onChange}>
        Pin
      </ToggleButton>
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(onChange).toHaveBeenCalledWith(true);
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleButton isDisabled onChange={onChange}>
        Pin
      </ToggleButton>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    await user.click(button);

    expect(onChange).not.toHaveBeenCalled();
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("defaults to the primary variant and accepts other variants", () => {
    const { rerender } = render(<ToggleButton>Pin</ToggleButton>);

    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "primary"
    );

    rerender(<ToggleButton variant="quiet">Pin</ToggleButton>);

    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "quiet");
  });
});
