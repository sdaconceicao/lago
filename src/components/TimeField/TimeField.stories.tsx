import type { Meta, StoryFn } from "@storybook/react";
import { TimeField } from "../TimeField/TimeField";

const meta: Meta<typeof TimeField> = {
  component: TimeField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof TimeField>;

export const Example: Story = (args) => <TimeField {...args} />;

Example.args = {
  label: "Event time",
};
