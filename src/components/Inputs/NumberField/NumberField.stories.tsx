import type { Meta, StoryFn } from "@storybook/react";
import { NumberField } from "./NumberField";

const meta: Meta<typeof NumberField> = {
  component: NumberField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A text input that accepts numeric values, with increment and decrement steppers. NumberField supports min/max/step constraints, formatting and parsing, a label, and validation, making it ideal for quantities and ranges.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof NumberField>;

export const Example: Story = (args) => <NumberField {...args} />;

Example.args = {
  label: "Cookies",
  placeholder: "-",
};
