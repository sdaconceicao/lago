import { act, fireEvent, render, screen } from "@testing-library/react";
import { parseColor } from "react-aria-components";
import { ColorArea } from "./ColorArea";

describe("ColorArea", () => {
  it("renders a group with two channel sliders", () => {
    render(<ColorArea aria-label="Color area" defaultValue="#ff0000" />);

    expect(
      screen.getByRole("group", { name: /color area/i })
    ).toBeInTheDocument();
    // The y channel input is aria-hidden, so include hidden elements
    expect(screen.getAllByRole("slider", { hidden: true })).toHaveLength(2);
  });

  it("reflects the default value in the channel inputs", () => {
    render(
      <ColorArea
        aria-label="Color area"
        colorSpace="hsb"
        xChannel="saturation"
        yChannel="brightness"
        defaultValue={parseColor("hsb(0, 50%, 25%)")}
      />
    );

    const [xInput, yInput] = screen.getAllByRole("slider", { hidden: true });

    expect((xInput as HTMLInputElement).value).toBe("50");
    expect((yInput as HTMLInputElement).value).toBe("25");
  });

  it("renders a thumb colored with the current value", () => {
    const { container } = render(
      <ColorArea
        aria-label="Color area"
        colorSpace="hsb"
        xChannel="saturation"
        yChannel="brightness"
        defaultValue={parseColor("hsb(0, 100%, 100%)")}
      />
    );

    const thumb = container.querySelector(".react-aria-ColorThumb");

    expect(thumb).not.toBeNull();
    expect((thumb as HTMLElement).style.backgroundColor).toContain("255, 0, 0");
  });

  it("increments the x channel with the right arrow key and fires onChange", () => {
    const onChange = vi.fn();
    render(
      <ColorArea
        aria-label="Color area"
        colorSpace="hsb"
        xChannel="saturation"
        yChannel="brightness"
        defaultValue={parseColor("hsb(0, 50%, 50%)")}
        onChange={onChange}
      />
    );

    const [xInput] = screen.getAllByRole("slider");
    act(() => xInput.focus());
    fireEvent.keyDown(xInput, { key: "ArrowRight" });

    expect(onChange).toHaveBeenCalled();
    const color = onChange.mock.calls.at(-1)?.[0];
    expect(color.getChannelValue("saturation")).toBe(51);
  });

  it("increments the y channel with the up arrow key", () => {
    const onChange = vi.fn();
    render(
      <ColorArea
        aria-label="Color area"
        colorSpace="hsb"
        xChannel="saturation"
        yChannel="brightness"
        defaultValue={parseColor("hsb(0, 50%, 50%)")}
        onChange={onChange}
      />
    );

    // Arrow keys are handled for both axes while the color area has focus
    const [xInput] = screen.getAllByRole("slider");
    act(() => xInput.focus());
    fireEvent.keyDown(xInput, { key: "ArrowUp" });

    const color = onChange.mock.calls.at(-1)?.[0];
    expect(color.getChannelValue("brightness")).toBe(51);
  });

  it("disables the channel inputs and ignores keys when isDisabled", () => {
    const onChange = vi.fn();
    render(
      <ColorArea
        aria-label="Color area"
        defaultValue="#ff0000"
        isDisabled
        onChange={onChange}
      />
    );

    const [xInput] = screen.getAllByRole("slider");

    expect(xInput).toBeDisabled();

    fireEvent.keyDown(xInput, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });
});
