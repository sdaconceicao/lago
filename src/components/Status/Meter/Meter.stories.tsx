import type { Meta, StoryFn } from "@storybook/react";
import { Meter } from "./Meter";

const meta: Meta<typeof Meter> = {
  component: Meter,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A visual display that shows a quantity within a known range, such as disk usage or password strength. Unlike ProgressBar, a Meter represents a measurement against a fixed maximum rather than task completion, and is not announced as a progress update.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Meter>;

export const Example: Story = (args) => <Meter {...args} />;

Example.args = {
  label: "Storage space",
  value: 80,
};
