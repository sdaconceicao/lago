import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { ToggleButton } from "@/components/Inputs/Toggle/ToggleButton/ToggleButton";
import { ToggleButtonGroup } from "./ToggleButtonGroup";

const meta: Meta<typeof ToggleButtonGroup> = {
  component: ToggleButtonGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A group of toggle buttons that can be selected independently or as a single choice, depending on the selection mode. ToggleButtonGroup manages the selected state and keyboard navigation among its ToggleButton children, often used for toolbars or option sets.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    onSelectionChange: fn(),
  },
};

export default meta;

type Story = StoryFn<typeof ToggleButtonGroup>;

export const Example: Story = (args) => (
  <ToggleButtonGroup {...args}>
    <ToggleButton id="left">Left</ToggleButton>
    <ToggleButton id="center">Center</ToggleButton>
    <ToggleButton id="right">Right</ToggleButton>
  </ToggleButtonGroup>
);

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
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
        <ToggleButtonGroup {...args} size={size} aria-label={label}>
          <ToggleButton id="left">Left</ToggleButton>
          <ToggleButton id="center">Center</ToggleButton>
          <ToggleButton id="right">Right</ToggleButton>
        </ToggleButtonGroup>
      </div>
    ))}
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'ToggleButtonGroup supports three sizes: "sm" renders 28px-tall buttons with 12px text and a 6px outer radius, "md" (the default) renders 36px-tall buttons with 14px text, and "lg" renders 48px-tall buttons with 16px text and 16px horizontal padding. The control scale mirrors the field scale numerically, so the steps line up step for step and a `size="md"` group is exactly as tall as a default 36px field. The size is set on the group and applies to every button inside it — the group\'s style rules outrank a child ToggleButton\'s own `size` prop on purpose, since a group of mismatched toggles is never wanted. Set `size` on the group, not on the individual buttons.',
    },
  },
};
