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

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <SegmentedControl {...args} size="sm" aria-label="View (small)">
      <SegmentedControlItem id="day">Day</SegmentedControlItem>
      <SegmentedControlItem id="week">Week</SegmentedControlItem>
      <SegmentedControlItem id="month">Month</SegmentedControlItem>
    </SegmentedControl>
    <SegmentedControl {...args} size="md" aria-label="View (medium)">
      <SegmentedControlItem id="day">Day</SegmentedControlItem>
      <SegmentedControlItem id="week">Week</SegmentedControlItem>
      <SegmentedControlItem id="month">Month</SegmentedControlItem>
    </SegmentedControl>
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'SegmentedControl supports two sizes: "sm" is 28px tall with 12px text, and "md" (the default) is 32px tall with 14px text. Setting the size on the control sizes every item inside it. The pill radius is fully rounded at both sizes. Like Button and ToggleButton, the control renders `data-size` rather than `data-field-size`, so it keeps the size you asked for even inside a compact field or form.',
    },
  },
};
