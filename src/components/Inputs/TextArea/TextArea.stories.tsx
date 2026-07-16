import type { Meta, StoryFn } from "@storybook/react";
import { TextArea } from "./TextArea";

const meta: Meta<typeof TextArea> = {
  component: TextArea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A multi-line text input for longer freeform text such as comments or descriptions. TextArea includes a label, optional description, placeholder, and validation states, and shares the label, help text, and inset field styling of TextField.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    placeholder: "Tell us a little about yourself",
  },
};

export default meta;

type Story = StoryFn<typeof TextArea>;

export const Example: Story = (args) => <TextArea {...args} />;

Example.args = {
  label: "Bio",
};
