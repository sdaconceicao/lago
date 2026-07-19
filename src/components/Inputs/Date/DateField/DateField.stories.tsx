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
