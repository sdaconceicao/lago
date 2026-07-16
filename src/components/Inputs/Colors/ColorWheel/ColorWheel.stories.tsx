import type { Meta, StoryFn } from "@storybook/react";
import { ColorWheel } from "./ColorWheel";

const meta: Meta<typeof ColorWheel> = {
  component: ColorWheel,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A circular color picker that lets the user adjust the hue and saturation of a color by dragging a handle around the wheel. The ColorWheel manages the hue and saturation channels while value (lightness) is typically controlled separately.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof ColorWheel>;

export const Example: Story = (args) => <ColorWheel {...args} />;

Example.args = {
  defaultValue: "hsl(30, 100%, 50%)",
};
