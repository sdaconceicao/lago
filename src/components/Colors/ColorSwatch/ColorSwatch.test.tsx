import { render, screen } from "@testing-library/react";
import { parseColor } from "react-aria-components";
import { ColorSwatch } from "./ColorSwatch";

describe("ColorSwatch", () => {
  it("renders an element with an img role", () => {
    render(<ColorSwatch color="#ff0000" />);

    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("has a default accessible label describing the color", () => {
    render(<ColorSwatch color="#ff0000" />);

    expect(screen.getByRole("img")).toHaveAccessibleName();
  });

  it("supports a custom aria-label", () => {
    render(<ColorSwatch color="#ff0000" aria-label="Brand red" />);

    // react-aria appends the color description to the provided label
    expect(screen.getByRole("img", { name: /brand red/i })).toBeInTheDocument();
  });

  it("layers the color over a checkered background", () => {
    render(<ColorSwatch color="#ff0000" />);

    const style = screen.getByRole("img").getAttribute("style") ?? "";

    expect(style).toContain("rgb(255, 0, 0)");
    expect(style).toContain("repeating-conic-gradient");
  });

  it("accepts a Color object value", () => {
    render(<ColorSwatch color={parseColor("#00ff00")} />);

    const style = screen.getByRole("img").getAttribute("style") ?? "";

    expect(style).toContain("rgb(0, 255, 0)");
  });
});
