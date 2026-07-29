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

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <Select {...args} size="sm" label="Small">
      <SelectItem id="chocolate">Chocolate</SelectItem>
      <SelectItem id="mint">Mint</SelectItem>
      <SelectItem id="strawberry">Strawberry</SelectItem>
      <SelectItem id="vanilla">Vanilla</SelectItem>
    </Select>
    <Select {...args} size="md" label="Medium (default)">
      <SelectItem id="chocolate">Chocolate</SelectItem>
      <SelectItem id="mint">Mint</SelectItem>
      <SelectItem id="strawberry">Strawberry</SelectItem>
      <SelectItem id="vanilla">Vanilla</SelectItem>
    </Select>
    <Select {...args} size="lg" label="Large">
      <SelectItem id="chocolate">Chocolate</SelectItem>
      <SelectItem id="mint">Mint</SelectItem>
      <SelectItem id="strawberry">Strawberry</SelectItem>
      <SelectItem id="vanilla">Vanilla</SelectItem>
    </Select>
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'Select supports three sizes: "sm" renders a compact 28px-tall field with 12px text and a 20px chevron toggle, "md" (the default) a 36px-tall field with 14px text and a 24px toggle, and "lg" a roomy 48px-tall field with 14px text and a 32px toggle. The size also travels to the dropdown, so its options and check marks scale with the field. Every field-like control at the same size shares its height, border radius, horizontal padding, and font size, so a Select lines up with a TextField, MultiSelect, or DatePicker placed beside it in a row.',
    },
  },
};
