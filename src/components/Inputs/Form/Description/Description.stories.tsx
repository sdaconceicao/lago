import type { Meta, StoryFn } from "@storybook/react";
import { TextField } from "@/components/Inputs/TextField/TextField";
import { Description } from "./Description";

const meta: Meta<typeof Description> = {
  component: Description,
  parameters: {
    docs: {
      description: {
        component:
          "Helper text shown below a form field. It is automatically hidden when the field is invalid (the error message takes its place).",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    children: "We'll never share your email.",
  },
};

export default meta;
type Story = StoryFn<typeof Description>;

export const Example: Story = (args) => (
  <Description>{args.children}</Description>
);

export const WithinField: Story = (args) => (
  <TextField
    label="Email"
    description={args.children as string}
    placeholder="Enter your email"
  />
);
