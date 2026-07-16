import type { Meta, StoryFn } from "@storybook/react";
import { ColorArea } from "./ColorArea";

const meta: Meta<typeof ColorArea> = {
  component: ColorArea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A two-dimensional color picker that lets the user adjust two color channels simultaneously by dragging a handle within a rectangular area. The channels (e.g. saturation and value) are configurable and shown along the X and Y axes.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof ColorArea>;

export const Example: Story = (args) => (
  <ColorArea {...args} style={{ width: 200 }} />
);

Example.args = {
  defaultValue: "hsl(30, 100%, 50%)",
};
