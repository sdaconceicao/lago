import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { DateField } from "./DateField";

const meta: Meta<typeof DateField> = {
  component: DateField,
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
          "An input that allows the user to enter and edit a date value using a keyboard or spinner. DateField is composed of segmented fields for the date segments (e.g. month, day, year) and supports locale-aware formatting, validation, and min/max dates.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof DateField>;

export const Example: Story = (args) => <DateField {...args} />;

Example.args = {
  label: "Event date",
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <DateField {...args} size="sm" label="Small" />
    <DateField {...args} size="md" label="Medium (default)" />
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'DateField supports two sizes: "sm" renders a compact 28px-tall field with 12px segments, and "md" (the default) renders a 48px-tall field with 14px segments. Every field-like control at the same size shares its height, border radius, horizontal padding, and font size, so a DateField lines up with a TextField, Select, or DatePicker placed beside it in a row.',
    },
  },
};
