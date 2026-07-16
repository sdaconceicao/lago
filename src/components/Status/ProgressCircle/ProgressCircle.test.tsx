import { render, screen } from "@testing-library/react";
import { ProgressCircle } from "./ProgressCircle";

describe("ProgressCircle", () => {
  it("renders an element with the progressbar role", () => {
    render(<ProgressCircle aria-label="Loading" value={25} />);

    expect(
      screen.getByRole("progressbar", { name: "Loading" })
    ).toBeInTheDocument();
  });

  it("exposes the value through aria attributes", () => {
    render(<ProgressCircle aria-label="Loading" value={25} />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "25");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("defaults to a 16px size", () => {
    render(<ProgressCircle aria-label="Loading" value={25} />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar.style.width).toBe("16px");
    expect(progressbar.style.height).toBe("16px");
  });

  it("applies a custom size", () => {
    render(<ProgressCircle aria-label="Loading" value={25} size={64} />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar.style.width).toBe("64px");
    expect(progressbar.style.height).toBe("64px");
  });

  it("renders a track circle and a fill circle", () => {
    const { container } = render(
      <ProgressCircle aria-label="Loading" value={25} />
    );

    expect(container.querySelectorAll("circle")).toHaveLength(2);
  });

  it("offsets the fill stroke according to the percentage", () => {
    const { container } = render(
      <ProgressCircle aria-label="Loading" value={40} />
    );

    const fill = container.querySelectorAll("circle")[1];
    expect(fill).toHaveAttribute("stroke-dashoffset", "60");
  });

  it("shows a partial spinner and animation when indeterminate", () => {
    const { container } = render(
      <ProgressCircle aria-label="Loading" isIndeterminate />
    );

    expect(screen.getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow"
    );

    const fill = container.querySelectorAll("circle")[1];
    expect(fill).toHaveAttribute("stroke-dashoffset", "75");
    expect(container.querySelector("animateTransform")).not.toBeNull();
  });

  it("does not render an animation when determinate", () => {
    const { container } = render(
      <ProgressCircle aria-label="Loading" value={40} />
    );

    expect(container.querySelector("animateTransform")).toBeNull();
  });
});
