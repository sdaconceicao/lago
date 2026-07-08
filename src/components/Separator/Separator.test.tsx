import { render, screen } from "@testing-library/react";
import { Separator } from "./Separator";

describe("Separator", () => {
  it("renders an hr separator by default", () => {
    render(<Separator />);

    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("HR");
  });

  it("applies the default react-aria class name", () => {
    render(<Separator />);

    expect(screen.getByRole("separator")).toHaveClass("react-aria-Separator");
  });

  it("is horizontal by default", () => {
    render(<Separator />);

    expect(screen.getByRole("separator")).not.toHaveAttribute(
      "aria-orientation",
      "vertical"
    );
  });

  it("renders a non-hr element with a vertical orientation", () => {
    render(<Separator orientation="vertical" />);

    const separator = screen.getByRole("separator");
    expect(separator.tagName).not.toBe("HR");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
  });

  it("supports a custom element type", () => {
    render(<Separator elementType="span" />);

    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("SPAN");
  });

  it("passes through a custom className and aria-label", () => {
    render(<Separator className="my-separator" aria-label="Section divider" />);

    const separator = screen.getByRole("separator", {
      name: "Section divider",
    });
    expect(separator).toHaveClass("my-separator");
    expect(separator).not.toHaveClass("react-aria-Separator");
  });
});
