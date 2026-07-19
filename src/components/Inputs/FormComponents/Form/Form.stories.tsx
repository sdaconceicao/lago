import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { Button } from "@/components/Actions/Button/Button";
import { TextField } from "@/components/Inputs/TextField/TextField";
import { Form } from "./Form";

const meta: Meta<typeof Form> = {
  component: Form,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A container for form fields that handles submission, validation, and data collection. Form coordinates the state of its child inputs (such as text fields), supports required fields, and provides built-in validation and accessibility.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    onSubmit: fn(),
    onReset: fn(),
    onInvalid: fn(),
  },
};

export default meta;
type Story = StoryFn<typeof Form>;

export const Example: Story = (args) => (
  <Form {...args}>
    <TextField
      name="email"
      type="email"
      isRequired
      label="Email"
      placeholder="Enter your email"
    />
    <Button type="submit">Submit</Button>
  </Form>
);
