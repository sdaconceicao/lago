import { act, render, screen } from "@testing-library/react";
import { parseColor } from "react-aria-components";
import { ColorArea } from "@/components/Inputs/Colors/ColorArea/ColorArea";
import { ColorSlider } from "@/components/Inputs/Colors/ColorSlider/ColorSlider";

const renderInColorArea = (defaultValue = "hsb(0, 50%, 50%)") =>
  render(
    <ColorArea
      aria-label="Color area"
      colorSpace="hsb"
      xChannel="saturation"
      yChannel="brightness"
      defaultValue={parseColor(defaultValue)}
    />
  );

describe("ColorThumb", () => {
  it("renders inside a color area", () => {
    const { container } = renderInColorArea();

    expect(container.querySelector(".react-aria-ColorThumb")).not.toBeNull();
  });

  it("renders inside a color slider track", () => {
    const { container } = render(
      <ColorSlider label="Hue" channel="hue" defaultValue="hsl(0, 100%, 50%)" />
    );

    expect(container.querySelector(".react-aria-ColorThumb")).not.toBeNull();
  });

  it("uses the current color as its background", () => {
    const { container } = renderInColorArea("hsb(0, 100%, 100%)");

    const thumb = container.querySelector(
      ".react-aria-ColorThumb"
    ) as HTMLElement;

    expect(thumb.style.backgroundColor).toContain("255, 0, 0");
  });

  it("is positioned according to the current channel values", () => {
    const { container } = renderInColorArea("hsb(0, 50%, 50%)");

    const thumb = container.querySelector(
      ".react-aria-ColorThumb"
    ) as HTMLElement;

    expect(thumb.style.left).toBe("50%");
    expect(thumb.style.top).toBe("50%");
  });

  it("reflects focus state when its input receives focus", () => {
    const { container } = renderInColorArea();

    const thumb = container.querySelector(
      ".react-aria-ColorThumb"
    ) as HTMLElement;
    const [input] = screen.getAllByRole("slider");

    expect(thumb).not.toHaveAttribute("data-focused");

    act(() => input.focus());

    expect(thumb).toHaveAttribute("data-focused", "true");
  });
});
