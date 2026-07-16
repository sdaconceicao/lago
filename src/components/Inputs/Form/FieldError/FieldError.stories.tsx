import type { Meta, StoryFn } from "@storybook/react";
import { TextField } from "@/components/Inputs/TextField/TextField";
import { FieldError } from "./FieldError";

const meta: Meta<typeof FieldError> = {
  component: FieldError,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Displays validation errors for a form field. It only renders when the field is invalid and a message is provided.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    children: "Please enter a valid email.",
  },
};

export default meta;
type Story = StoryFn<typeof FieldError>;

export const Example: Story = (args) => (
  <TextField label="Email" isInvalid errorMessage={undefined}>
    <FieldError {...args} />
    <input aria-label="Email" placeholder="Enter your email" />
  </TextField>
);

export const WithinInvalidField: Story = (args) => (
  <TextField
    label="Email"
    isInvalid
    errorMessage={args.children as string}
    placeholder="Enter your email"
  />
);
