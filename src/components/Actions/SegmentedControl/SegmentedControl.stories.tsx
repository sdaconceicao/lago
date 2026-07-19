import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { SegmentedControl, SegmentedControlItem } from "./SegmentedControl";

const meta: Meta<typeof SegmentedControl> = {
  component: SegmentedControl,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A group of toggle buttons displayed as a single segmented control. Compose `SegmentedControlItem` elements inside a `SegmentedControl`, and use `selectionMode` to allow single or multiple selection.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    onSelectionChange: fn(),
  },
};

export default meta;
type Story = StoryFn<typeof SegmentedControl>;

export const Example: Story = (args) => (
  <SegmentedControl {...args}>
    <SegmentedControlItem id="day">Day</SegmentedControlItem>
    <SegmentedControlItem id="week">Week</SegmentedControlItem>
    <SegmentedControlItem id="month">Month</SegmentedControlItem>
  </SegmentedControl>
);
