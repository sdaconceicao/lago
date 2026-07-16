import { act, fireEvent, render, screen } from "@testing-library/react";
import { parseColor } from "react-aria-components";
import { ColorWheel } from "./ColorWheel";

describe("ColorWheel", () => {
  it("renders a hue slider input", () => {
    render(<ColorWheel defaultValue="hsl(0, 100%, 50%)" />);

    const slider = screen.getByRole("slider", { name: "Hue" });

    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "360");
  });

  it("renders the wheel track and thumb", () => {
    const { container } = render(
      <ColorWheel defaultValue="hsl(0, 100%, 50%)" />
    );

    expect(
      container.querySelector(".react-aria-ColorWheelTrack")
    ).not.toBeNull();
    expect(container.querySelector(".react-aria-ColorThumb")).not.toBeNull();
  });

  it("sizes the track from its fixed outer radius", () => {
    const { container } = render(
      <ColorWheel defaultValue="hsl(0, 100%, 50%)" />
    );

    const track = container.querySelector(
      ".react-aria-ColorWheelTrack"
    ) as HTMLElement;

    expect(track.style.width).toBe("200px");
    expect(track.style.height).toBe("200px");
  });

  it("reflects the default hue in the slider input", () => {
    render(<ColorWheel defaultValue={parseColor("hsl(90, 100%, 50%)")} />);

    const slider = screen.getByRole("slider") as HTMLInputElement;

    expect(slider.value).toBe("90");
    expect(slider).toHaveAttribute(
      "aria-valuetext",
      expect.stringContaining("90°")
    );
  });

  it("increments the hue with the right arrow key and fires onChange", () => {
    const onChange = vi.fn();
    render(
      <ColorWheel
        defaultValue={parseColor("hsl(0, 100%, 50%)")}
        onChange={onChange}
      />
    );

    const slider = screen.getByRole("slider");
    act(() => slider.focus());
    fireEvent.keyDown(slider, { key: "ArrowRight" });

    expect(onChange).toHaveBeenCalled();
    const color = onChange.mock.calls.at(-1)?.[0];
    expect(color.getChannelValue("hue")).toBe(1);
  });

  it("disables the slider and ignores keys when isDisabled", () => {
    const onChange = vi.fn();
    render(
      <ColorWheel
        defaultValue="hsl(0, 100%, 50%)"
        isDisabled
        onChange={onChange}
      />
    );

    const slider = screen.getByRole("slider");

    expect(slider).toBeDisabled();

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });
});
