import type { Meta, StoryFn } from "@storybook/react";
import { DatePicker } from "./DatePicker";

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
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
