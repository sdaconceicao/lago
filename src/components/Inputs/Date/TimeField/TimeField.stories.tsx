import type { Meta, StoryFn } from "@storybook/react";
import { TimeField } from "./TimeField";

const meta: Meta<typeof TimeField> = {
  component: TimeField,
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
