import type { Meta, StoryFn } from "@storybook/react";
import { Slider } from "./Slider";

const meta: Meta<typeof Slider> = {
  component: Slider,
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
