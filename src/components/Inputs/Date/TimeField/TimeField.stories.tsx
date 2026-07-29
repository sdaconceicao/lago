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
    <TimeField {...args} size="lg" label="Large" />
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'TimeField supports three sizes: "sm" renders a compact 28px-tall field with 12px segments, "md" (the default) a 36px-tall field with 14px segments, and "lg" a roomy 48px-tall field, also with 14px segments — "md" and "lg" differ in height and text inset rather than type size. TimeField shares the DateField surface, including its minimum width, so the two are interchangeable in a row: every field-like control at the same size shares its height, border radius, horizontal padding, and font size.',
    },
  },
};
