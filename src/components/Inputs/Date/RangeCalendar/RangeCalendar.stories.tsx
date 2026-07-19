import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { RangeCalendar } from "./RangeCalendar";

const meta: Meta<typeof RangeCalendar> = {
  component: RangeCalendar,
  args: {
    onChange: fn(),
    onFocusChange: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A calendar that allows the user to select a contiguous range of dates. RangeCalendar supports keyboard navigation across ranges, localization, and disabled or unavailable dates, and can be used standalone or within a DateRangePicker.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof RangeCalendar>;

export const Example: Story = (args) => (
  <RangeCalendar aria-label="Trip dates" {...args} />
);
