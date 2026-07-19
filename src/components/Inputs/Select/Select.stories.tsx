import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { Select, SelectItem } from "./Select";

const meta: Meta<typeof Select> = {
  component: Select,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A single-select combobox. Typing in the field filters the options and the chosen option fills the field. ",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    placeholder: "Select an item",
    onSelectionChange: fn(),
    onInputChange: fn(),
    onOpenChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
};

export default meta;

type Story = StoryFn<typeof Select>;

export const Example: Story = (args) => (
  <Select {...args}>
    <SelectItem id="chocolate">Chocolate</SelectItem>
    <SelectItem id="mint">Mint</SelectItem>
    <SelectItem id="strawberry">Strawberry</SelectItem>
    <SelectItem id="vanilla">Vanilla</SelectItem>
  </Select>
);

Example.args = {
  label: "Ice cream flavor",
};
