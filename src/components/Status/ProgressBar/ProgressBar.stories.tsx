import type { Meta, StoryFn } from "@storybook/react";
import { ProgressBar } from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  component: ProgressBar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A visual indicator that shows the progression of a task, such as downloading or uploading. ProgressBar displays a label and a fill that represents the value relative to a known or indeterminate total.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof ProgressBar>;

export const Example: Story = (args) => <ProgressBar {...args} />;

Example.args = {
  label: "Loading…",
  value: 80,
};
