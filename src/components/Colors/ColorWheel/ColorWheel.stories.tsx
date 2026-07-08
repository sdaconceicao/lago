import type { Meta, StoryFn } from "@storybook/react";
import { ColorWheel } from "./ColorWheel";

const meta: Meta<typeof ColorWheel> = {
  component: ColorWheel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof ColorWheel>;

export const Example: Story = (args) => <ColorWheel {...args} />;

Example.args = {
  defaultValue: "hsl(30, 100%, 50%)",
};
