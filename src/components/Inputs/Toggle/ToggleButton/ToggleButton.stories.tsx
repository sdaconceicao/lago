import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { ToggleButton } from "./ToggleButton";

const meta: Meta<typeof ToggleButton> = {
  component: ToggleButton,
  args: {
    onChange: fn(),
    onPress: fn(),
    onPressStart: fn(),
    onPressEnd: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onHoverChange: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A button that can be toggled between pressed and unpressed (selected and unselected) states, similar to a checkbox but styled as a button. Often used in groups for mutually exclusive or multi-select options like text formatting.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof ToggleButton>;

export const Example: Story = (args) => (
  <ToggleButton {...args}>Pin</ToggleButton>
);

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
    <ToggleButton {...args} size="sm">
      Small
    </ToggleButton>
    <ToggleButton {...args} size="md">
      Medium (default)
    </ToggleButton>
    <ToggleButton {...args} size="lg">
      Large
    </ToggleButton>
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'ToggleButton supports three sizes: "sm" is 28px tall with 12px text and a 6px radius, "md" (the default) is 36px tall with 14px text, and "lg" is 48px tall with 16px horizontal padding. The control scale mirrors the field scale numerically, so the steps line up step for step — `size="md"` is exactly as tall as a default 36px field, and a Button and a ToggleButton of the same `size` sit at the same height in a toolbar. Like Button, a ToggleButton renders `data-size` rather than `data-field-size` and ignores the field custom properties, so it keeps its own height inside a compact field. Inside a ToggleButtonGroup the group\'s `size` wins over this prop.',
    },
  },
};
