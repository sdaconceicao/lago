import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleButton } from "@/components/Inputs/Toggle/ToggleButton/ToggleButton";
import { IconToggleButton } from "./IconToggleButton";

const Icon = () => (
  <svg aria-hidden="true" viewBox="0 0 16 16">
    <title>icon</title>
    <path d="M0 0h16v16H0z" />
  </svg>
);

/**
 * The shape used to be decided in CSS by `:has(> span > svg:only-child)`. That
 * looks equivalent and is not: `:only-child` counts element children and
 * ignores text nodes, so an icon with a label beside it still matched and
 * collapsed to a circle with the text spilling out of it.
 */
describe("IconToggleButton", () => {
  it("renders a toggle carrying its accessible name", () => {
    render(
      <IconToggleButton aria-label="Bold">
        <Icon />
      </IconToggleButton>
    );

    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
  });

  it("marks itself icon-only so the shape rules can find it", () => {
    render(
      <IconToggleButton aria-label="Bold">
        <Icon />
      </IconToggleButton>
    );

    expect(screen.getByRole("button")).toHaveAttribute("data-icon-only");
  });

  it("leaves a labelled ToggleButton unmarked", () => {
    render(
      <ToggleButton>
        <Icon />
        Bold
      </ToggleButton>
    );

    expect(screen.getByRole("button")).not.toHaveAttribute("data-icon-only");
  });

  it("keeps ToggleButton's own classes so every variant and state still applies", () => {
    render(
      <IconToggleButton aria-label="Bold" variant="secondary">
        <Icon />
      </IconToggleButton>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("react-aria-ToggleButton");
    expect(button).toHaveAttribute("data-variant", "secondary");
  });

  it("passes size through", () => {
    render(
      <IconToggleButton aria-label="Bold" size="lg">
        <Icon />
      </IconToggleButton>
    );

    expect(screen.getByRole("button")).toHaveAttribute("data-size", "lg");
  });

  it("merges a caller's className rather than dropping it", () => {
    render(
      <IconToggleButton aria-label="Bold" className="probe">
        <Icon />
      </IconToggleButton>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("probe");
    expect(button).toHaveClass("react-aria-ToggleButton");
  });

  it("toggles on press", async () => {
    const onChange = vi.fn();
    render(
      <IconToggleButton aria-label="Bold" onChange={onChange}>
        <Icon />
      </IconToggleButton>
    );

    await userEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("is disabled when asked", () => {
    render(
      <IconToggleButton aria-label="Bold" isDisabled>
        <Icon />
      </IconToggleButton>
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
