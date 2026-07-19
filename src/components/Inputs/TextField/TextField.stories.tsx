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
