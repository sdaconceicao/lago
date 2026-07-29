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
    {(
      [
        ["sm", "Small"],
        ["md", "Medium (default)"],
        ["lg", "Large"],
      ] as const
    ).map(([size, label]) => (
      <div
        key={size}
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <span style={{ font: "var(--font-size-sm) var(--font-family)" }}>
          {label}
        </span>
        <SegmentedControl {...args} size={size} aria-label={`View (${label})`}>
          <SegmentedControlItem id="day">Day</SegmentedControlItem>
          <SegmentedControlItem id="week">Week</SegmentedControlItem>
          <SegmentedControlItem id="month">Month</SegmentedControlItem>
        </SegmentedControl>
      </div>
    ))}
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'SegmentedControl supports three sizes: "sm" is 28px tall with 12px text, "md" (the default) is 36px tall with 14px text, and "lg" is 48px tall with 16px horizontal padding. The control scale mirrors the field scale numerically, so the steps line up step for step — a `size="md"` control is exactly as tall as a default 36px field, and matches a `size="md"` Button beside it. Setting the size on the control sizes every item inside it; the root adds no vertical padding, so an item\'s height is the control\'s full height. The pill radius stays fully rounded at every size. Like Button and ToggleButton, the control renders `data-size` rather than `data-field-size` and ignores the field custom properties, so it keeps the size you asked for even inside a compact field or form.',
    },
  },
};
