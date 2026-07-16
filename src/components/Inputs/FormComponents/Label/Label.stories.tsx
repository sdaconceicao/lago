import type { Meta, StoryFn } from "@storybook/react";
import { Label } from "./Label";

const meta: Meta<typeof Label> = {
  component: Label,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A label for a form field. Associate it with an input via the `htmlFor` prop or by nesting it inside a field component.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    children: "Email",
  },
};

export default meta;
type Story = StoryFn<typeof Label>;

export const Example: Story = (args) => <Label {...args} />;

export const Required: Story = (args) => <Label {...args} isRequired />;
Required.parameters = {
  docs: {
    description: {
      story:
        "Set `isRequired` to append a danger-styled asterisk, marking the associated field as required. Field components such as TextField forward their own `isRequired` prop to the Label automatically.",
    },
  },
};
