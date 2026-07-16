import type { Meta, StoryFn } from "@storybook/react";
import { TextField } from "@/components/Inputs/TextField/TextField";
import { FieldButton } from "./FieldButton";

const meta: Meta<typeof FieldButton> = {
  component: FieldButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A button styled to sit inside a form field, commonly used for clear or reveal-password actions.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    children: "Clear",
  },
};

export default meta;
type Story = StoryFn<typeof FieldButton>;

export const Example: Story = (args) => (
  <TextField label="Email">
    <input aria-label="Email" placeholder="Enter your email" />
    <FieldButton {...args} />
  </TextField>
);
