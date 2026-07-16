import type { Meta, StoryFn } from "@storybook/react";
import { Calendar } from "./Calendar";

const meta: Meta<typeof Calendar> = {
  component: Calendar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A month-based calendar that allows the user to select a single date. Calendar supports keyboard navigation, localization, disabled and unavailable dates, and can be used standalone or within a DatePicker.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Calendar>;

export const Example: Story = (args) => (
  <Calendar aria-label="Event date" {...args} />
);
