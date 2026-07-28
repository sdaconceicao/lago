import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
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
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
};

export default meta;
type Story = StoryFn<typeof NumberField>;

export const Example: Story = (args) => <NumberField {...args} />;

Example.args = {
  label: "Cookies",
  placeholder: "-",
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <NumberField {...args} size="sm" label="Small" />
    <NumberField {...args} size="md" label="Medium (default)" />
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'NumberField supports two sizes: "sm" renders a compact 28px-tall field with 12px text and 20px steppers, and "md" (the default) renders a 48px-tall field with 14px text and 32px steppers. The height, border radius, and font size match the other fields at the same size, so a NumberField lines up with a TextField or Select beside it — but note its group is sized to fit its content rather than stretching to fill the row.',
    },
  },
};
