import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { TimeField } from "./TimeField";

const meta: Meta<typeof TimeField> = {
  component: TimeField,
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An input that allows the user to enter and edit a time value using a keyboard or spinner. TimeField is composed of segmented fields for hours, minutes, and seconds, and supports locale-aware formatting, min/max values, and validation.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof TimeField>;

export const Example: Story = (args) => <TimeField {...args} />;

Example.args = {
  label: "Event time",
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <TimeField {...args} size="sm" label="Small" />
    <TimeField {...args} size="md" label="Medium (default)" />
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'TimeField supports two sizes: "sm" renders a compact 28px-tall field with 12px segments, and "md" (the default) renders a 48px-tall field with 14px segments. Every field-like control at the same size shares its height, border radius, horizontal padding, and font size, so a TimeField lines up with a DateField, TextField, or Select placed beside it in a row.',
    },
  },
};
