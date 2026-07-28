import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { DatePicker } from "./DatePicker";

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  args: {
    onChange: fn(),
    onOpenChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A text input combined with a calendar popover that lets the user type a date or pick one visually. DatePicker supports locale-aware formatting, validation, min/max constraints, and disabled or unavailable dates.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof DatePicker>;

export const Example: Story = (args) => <DatePicker {...args} />;

Example.args = {
  label: "Event date",
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <DatePicker {...args} size="sm" label="Small" />
    <DatePicker {...args} size="md" label="Medium (default)" />
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'DatePicker supports two sizes: "sm" renders a compact 28px-tall field with a 20px trigger, and "md" (the default) renders a 48px-tall field with a 32px trigger. Every field-like control at the same size shares its height, border radius, horizontal padding, and font size, so a DatePicker lines up with a TextField or Select placed beside it in a row. The calendar popover is the same size at both, so its day cells stay comfortable pointer targets.',
    },
  },
};
