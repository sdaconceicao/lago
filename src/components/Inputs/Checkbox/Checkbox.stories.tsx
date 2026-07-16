import type { Meta, StoryFn } from "@storybook/react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A control that lets the user select or deselect a single option. Checkboxes can be used standalone or grouped (via CheckboxGroup) to allow multiple independent selections, and support an indeterminate state to represent a partially selected group.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Checkbox>;

export const Example: Story = (args) => (
  <Checkbox {...args}>Unsubscribe</Checkbox>
);
