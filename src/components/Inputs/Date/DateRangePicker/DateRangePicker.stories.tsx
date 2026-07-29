import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { DateRangePicker } from "./DateRangePicker";

const meta: Meta<typeof DateRangePicker> = {
  component: DateRangePicker,
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

export const Sizes: Story = (args) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      width: 320,
    }}
  >
    <DateRangePicker {...args} size="sm" label="Small" />
    <DateRangePicker {...args} size="md" label="Medium (default)" />
    <DateRangePicker {...args} size="lg" label="Large" />
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'DateRangePicker supports three sizes: "sm" renders a compact 28px-tall field with 12px segments and a 20px calendar trigger, "md" (the default) a 36px-tall field with 14px segments and a 24px trigger, and "lg" a roomy 48px-tall field with 14px segments and a 32px trigger. Every field-like control at the same size shares its height, border radius, horizontal padding, and font size, so a DateRangePicker lines up with a TextField or Select placed beside it in a row. The range calendar popover is the same size at all three, so its day cells stay comfortable pointer targets. Two date inputs, a separator, and the trigger share one field here, so the larger sizes need more width: this story is 320px wide, which fits a US-format range at every size. Narrower than about 280px an "lg" field starts scrolling its dates horizontally rather than growing.',
    },
  },
};
