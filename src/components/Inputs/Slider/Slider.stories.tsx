import type { Meta, StoryFn } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { Slider } from "./Slider";

const meta: Meta<typeof Slider> = {
  component: Slider,
  args: {
    onChange: fn(),
    onChangeEnd: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An input that lets the user select one or more values from a range by dragging a thumb along a track. Slider supports single or multiple thumbs, a fill between them, optional labels, min/max/step constraints, and keyboard adjustment.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof Slider>;

export const Example: Story = (args) => (
  <Slider {...args} style={{ width: 200 }} />
);

Example.args = {
  label: "Range",
  defaultValue: [30, 60],
  thumbLabels: ["start", "end"],
};

export const Sizes: Story = (args) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      width: 200,
    }}
  >
    <Slider {...args} size="sm" label="Small" defaultValue={30} />
    <Slider {...args} size="md" label="Medium (default)" defaultValue={30} />
  </div>
);

/**
 * Drags each thumb the full width of its track. This is a real-pointer
 * regression guard: when the thumb was keyed on its value it remounted on every
 * change, which threw away the in-flight pointer capture, so a drag could only
 * ever move the value by a single step.
 */
Sizes.play = async ({ canvasElement }) => {
  const tracks = canvasElement.querySelectorAll(".react-aria-SliderTrack");
  expect(tracks).toHaveLength(2);

  for (const track of tracks) {
    const thumb = track.querySelector<HTMLElement>(".react-aria-SliderThumb");
    const input = track.querySelector<HTMLInputElement>("input");
    if (!thumb || !input) throw new Error("slider thumb not found");

    const { left, right, top, height } = track.getBoundingClientRect();
    const y = top + height / 2;
    const pointer = (type: string, x: number, target: EventTarget) => {
      target.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
          button: 0,
          buttons: type === "pointerup" ? 0 : 1,
          clientX: x,
          clientY: y,
        })
      );
    };

    pointer("pointerdown", left + (right - left) * 0.3, thumb);
    pointer("pointermove", right, window);
    pointer("pointerup", right, window);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Dragging to the far end of the track must reach the maximum, not inch a
    // single step away from the starting value of 30.
    expect(Number(input.value)).toBe(100);
  }
};

Sizes.parameters = {
  docs: {
    description: {
      story:
        'Slider supports two sizes: "sm" scales the thumb, rail, and label text down so the control sits comfortably beside 28px-tall fields, and "md" (the default) is the standard control. A Slider is not a field box — its label and output sit on their own row above the track — so it does not share the height of a TextField, Select, or DatePicker and will not row-align with them; matching the size only keeps the type and control weight consistent across a compact form.',
    },
  },
};
