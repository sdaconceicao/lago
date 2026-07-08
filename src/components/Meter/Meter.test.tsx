import { render, screen } from "@testing-library/react";
import { Meter } from "./Meter";

describe("Meter", () => {
  it("renders an element with the meter role", () => {
    render(<Meter label="Storage space" value={80} />);

    expect(screen.getByRole("meter")).toBeInTheDocument();
  });

  it("is labelled by the provided label", () => {
    render(<Meter label="Storage space" value={80} />);

    expect(
      screen.getByRole("meter", { name: "Storage space" })
    ).toBeInTheDocument();
  });

  it("exposes the value through aria attributes", () => {
    render(<Meter label="Storage space" value={80} />);

    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "80");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("aria-valuetext", "80%");
  });

  it("displays the formatted value text", () => {
    render(<Meter label="Storage space" value={80} />);

    expect(screen.getByText("80%")).toHaveClass("value");
  });

  it("sizes the fill according to the percentage", () => {
    const { container } = render(<Meter label="Storage space" value={35} />);

    const fill = container.querySelector<HTMLElement>(".fill");
    expect(fill).not.toBeNull();
    expect(fill?.style.width).toBe("35%");
  });

  it("computes the percentage from custom min and max values", () => {
    render(
      <Meter label="Storage space" value={25} minValue={0} maxValue={50} />
    );

    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "25");
    expect(meter).toHaveAttribute("aria-valuemax", "50");
    expect(meter).toHaveAttribute("aria-valuetext", "50%");
  });

  it("uses green, orange, and red fill colors based on thresholds", () => {
    const getFillColor = (value: number) => {
      const { container, unmount } = render(
        <Meter label="Storage space" value={value} />
      );
      const fill = container.querySelector<HTMLElement>(".fill");
      const color = fill?.style.getPropertyValue("--fill-color");
      unmount();
      return color;
    };

    expect(getFillColor(50)).toBe("var(--green)");
    expect(getFillColor(75)).toBe("var(--orange)");
    expect(getFillColor(95)).toBe("var(--red)");
  });
});
