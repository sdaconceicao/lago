import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import utils from "@/styles/utilities.module.css";
import { Button } from "./Button";
import styles from "./Button.module.css";

describe("Button", () => {
  it("renders a button with its children", () => {
    render(<Button>Press me</Button>);

    expect(
      screen.getByRole("button", { name: "Press me" })
    ).toBeInTheDocument();
  });

  it("applies the base class names", () => {
    render(<Button>Press me</Button>);

    expect(screen.getByRole("button")).toHaveClass(
      "react-aria-Button",
      styles.button,
      utils.buttonBase
    );
  });

  it("defaults to the primary variant", () => {
    render(<Button>Press me</Button>);

    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "primary"
    );
  });

  it.each(["primary", "secondary", "quiet"] as const)(
    "reflects the %s variant as a data attribute",
    (variant) => {
      render(<Button variant={variant}>Press me</Button>);

      expect(screen.getByRole("button")).toHaveAttribute(
        "data-variant",
        variant
      );
    }
  );

  it("calls onPress when clicked", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Press me</Button>);

    await user.click(screen.getByRole("button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Button isDisabled onPress={onPress}>
        Press me
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    await user.click(button);

    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows a progress circle instead of children when pending", () => {
    render(<Button isPending>Save</Button>);

    const button = screen.getByRole("button");
    expect(button).not.toHaveTextContent("Save");
    expect(
      screen.getByRole("progressbar", { name: "Saving..." })
    ).toBeInTheDocument();
  });

  it("does not call onPress while pending", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      <Button isPending onPress={onPress}>
        Save
      </Button>
    );

    await user.click(screen.getByRole("button"));

    expect(onPress).not.toHaveBeenCalled();
  });
});
