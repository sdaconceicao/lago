import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { ColorSlider } from "./ColorSlider";

const meta: Meta<typeof ColorSlider> = {
  component: ColorSlider,
  args: {
    onChange: fn(),
    onChangeEnd: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A draggable slider that adjusts a single color channel, such as hue, saturation, lightness, or alpha. ColorSlider visually previews the gradient of the channel it controls and is commonly used within a ColorPicker.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof ColorSlider>;

export const Example: Story = (args) => (
  <ColorSlider {...args} style={{ width: 200 }} />
);

Example.args = {
  label: "Red Opacity",
  defaultValue: "#f00",
  channel: "alpha",
};
