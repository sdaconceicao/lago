import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("renders an element with the progressbar role", () => {
    render(<ProgressBar label="Loading" value={30} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("is labelled by the provided label", () => {
    render(<ProgressBar label="Loading" value={30} />);

    expect(
      screen.getByRole("progressbar", { name: "Loading" })
    ).toBeInTheDocument();
  });

  it("exposes the value through aria attributes", () => {
    render(<ProgressBar label="Loading" value={30} />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "30");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    expect(progressbar).toHaveAttribute("aria-valuetext", "30%");
  });

  it("displays the formatted value text", () => {
    render(<ProgressBar label="Loading" value={30} />);

    expect(screen.getByText("30%")).toHaveClass("value");
  });

  it("sets the fill percentage custom property from the value", () => {
    const { container } = render(<ProgressBar label="Loading" value={45} />);

    const fill = container.querySelector<HTMLElement>(".fill");
    expect(fill).not.toBeNull();
    expect(fill?.style.getPropertyValue("--percent")).toBe("45%");
  });

  it("computes the percentage from custom min and max values", () => {
    render(
      <ProgressBar label="Loading" value={50} minValue={0} maxValue={200} />
    );

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    expect(progressbar).toHaveAttribute("aria-valuemax", "200");
    expect(progressbar).toHaveAttribute("aria-valuetext", "25%");
  });

  it("omits aria-valuenow and fills the track when indeterminate", () => {
    const { container } = render(
      <ProgressBar label="Loading" isIndeterminate />
    );

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).not.toHaveAttribute("aria-valuenow");

    const fill = container.querySelector<HTMLElement>(".fill");
    expect(fill?.style.getPropertyValue("--percent")).toBe("100%");
  });
});
