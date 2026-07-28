import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { TextField } from "./TextField";

const meta: Meta<typeof TextField> = {
  component: TextField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A text input that allows the user to enter and edit a single line of text. TextField includes a label, optional description, placeholder, and validation states, and supports variants like email, password, and search input types.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    placeholder: "Enter your full name",
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
};

export default meta;

type Story = StoryFn<typeof TextField>;

export const Example: Story = (args) => <TextField {...args} />;

Example.args = {
  label: "Name",
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <TextField {...args} size="sm" label="Small" />
    <TextField {...args} size="md" label="Medium (default)" />
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'TextField supports two sizes: "sm" renders a compact 28px-tall field with 12px text, and "md" (the default) renders a 48px-tall field with 14px text. Every field-like control at the same size shares its height, border radius, horizontal padding, and font size, so a TextField lines up with a Select, DatePicker, or NumberField placed beside it in a row.',
    },
  },
};
