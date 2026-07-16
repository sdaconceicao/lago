import { act, fireEvent, render, screen } from "@testing-library/react";
import { parseColor } from "react-aria-components";
import { ColorSlider } from "./ColorSlider";

describe("ColorSlider", () => {
  it("renders a labeled slider", () => {
    render(
      <ColorSlider label="Hue" channel="hue" defaultValue="hsl(0, 100%, 50%)" />
    );

    expect(screen.getByText("Hue")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /hue/i })).toBeInTheDocument();
  });

  it("reflects the default value in the slider input", () => {
    render(
      <ColorSlider
        label="Hue"
        channel="hue"
        defaultValue={parseColor("hsl(90, 100%, 50%)")}
      />
    );

    const slider = screen.getByRole("slider") as HTMLInputElement;

    expect(slider.value).toBe("90");
    expect(slider).toHaveAttribute("max", "360");
  });

  it("renders a slider output with the current value", () => {
    const { container } = render(
      <ColorSlider
        label="Hue"
        channel="hue"
        defaultValue="hsl(90, 100%, 50%)"
      />
    );

    const output = container.querySelector("output");

    expect(output).not.toBeNull();
    expect(output?.textContent).toContain("90");
  });

  it("increments the channel with the right arrow key and fires onChange", () => {
    const onChange = vi.fn();
    render(
      <ColorSlider
        label="Hue"
        channel="hue"
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

  it("supports the alpha channel", () => {
    render(
      <ColorSlider
        label="Alpha"
        channel="alpha"
        defaultValue={parseColor("rgba(255, 0, 0, 0.5)")}
      />
    );

    const slider = screen.getByRole("slider") as HTMLInputElement;

    expect(slider.value).toBe("0.5");
  });

  it("disables the slider and ignores keys when isDisabled", () => {
    const onChange = vi.fn();
    render(
      <ColorSlider
        label="Hue"
        channel="hue"
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
