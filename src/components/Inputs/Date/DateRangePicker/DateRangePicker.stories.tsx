import type { Meta, StoryFn } from "@storybook/react";
import { DateRangePicker } from "./DateRangePicker";

const meta: Meta<typeof DateRangePicker> = {
  component: DateRangePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A text input combined with a range calendar popover that lets the user type or visually select a start and end date. DateRangePicker supports locale-aware formatting, validation, and disabled or unavailable date ranges.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof DateRangePicker>;

export const Example: Story = (args) => <DateRangePicker {...args} />;

Example.args = {
  label: "Event date",
};
