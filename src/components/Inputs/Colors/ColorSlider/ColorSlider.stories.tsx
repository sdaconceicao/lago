import type { Meta, StoryFn } from "@storybook/react";
import { ColorSlider } from "./ColorSlider";

const meta: Meta<typeof ColorSlider> = {
  component: ColorSlider,
  parameters: {
    layout: "centered",
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
