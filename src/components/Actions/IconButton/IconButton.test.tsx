import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconButton } from "./IconButton";

const Icon = () => (
  <svg aria-hidden="true" viewBox="0 0 16 16">
    <title>icon</title>
    <path d="M0 0h16v16H0z" />
  </svg>
);

/**
 * The shape used to be decided in CSS by `:has(> svg:only-child)`. That looks
 * equivalent and is not: `:only-child` counts element children and ignores text
 * nodes, so `<Button><Icon />Back</Button>` matched and collapsed to a circle
 * with the label spilling out of it. Asking for the shape by name removes the
 * guess — and lets the accessible name be required, which an icon cannot supply
 * on its own.
 */
describe("IconButton", () => {
  it("renders a button carrying its accessible name", () => {
    render(
      <IconButton aria-label="Close">
        <Icon />
      </IconButton>
    );

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("keeps Button's own classes so every variant and state still applies", () => {
    render(
      <IconButton aria-label="Close" variant="error">
        <Icon />
      </IconButton>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("react-aria-Button");
    expect(button).toHaveAttribute("data-variant", "error");
  });

  it("passes size through", () => {
    render(
      <IconButton aria-label="Close" size="lg">
        <Icon />
      </IconButton>
    );

    expect(screen.getByRole("button")).toHaveAttribute("data-size", "lg");
  });

  it("merges a caller's className rather than dropping it", () => {
    render(
      <IconButton aria-label="Close" className="probe">
        <Icon />
      </IconButton>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("probe");
    expect(button).toHaveClass("react-aria-Button");
  });

  it("fires onPress", async () => {
    const onPress = vi.fn();
    render(
      <IconButton aria-label="Close" onPress={onPress}>
        <Icon />
      </IconButton>
    );

    await userEvent.click(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("is disabled when asked", () => {
    render(
      <IconButton aria-label="Close" isDisabled>
        <Icon />
      </IconButton>
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
