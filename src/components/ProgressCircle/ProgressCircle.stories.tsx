import type { Meta, StoryFn } from "@storybook/react";
import { ProgressCircle } from "./ProgressCircle";

const meta: Meta<typeof ProgressCircle> = {
  component: ProgressCircle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A circular indicator that shows the progression of a task. ProgressCircle displays a fill that represents the value relative to a known or indeterminate total. Pass `value` and `maxValue`, or omit `value` for an indeterminate state.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof ProgressCircle>;

export const Example: Story = (args) => <ProgressCircle {...args} />;

Example.args = {
  "aria-label": "Loading…",
  value: 80,
};

export const Indeterminate: Story = (args) => (
  <ProgressCircle {...args} aria-label="Loading…" />
);

export const CustomSize: Story = (args) => <ProgressCircle {...args} size={48} />;

CustomSize.args = {
  "aria-label": "Loading…",
  value: 60,
};
