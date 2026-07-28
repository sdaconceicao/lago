import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
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
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
};

export default meta;

type Story = StoryFn<typeof TextArea>;

export const Example: Story = (args) => <TextArea {...args} />;

Example.args = {
  label: "Bio",
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <TextArea {...args} size="sm" label="Small" />
    <TextArea {...args} size="md" label="Medium (default)" />
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'TextArea supports two sizes: "sm" renders a compact field with 12px text, 8px horizontal padding, and a 44px minimum height, and "md" (the default) renders 14px text, 16px horizontal padding, and a 64px minimum height. Because a TextArea is multi-line and resizable, its height can never match a single-line control, so it does not row-align with a TextField or Select the way those fields align with each other — at a given size it only shares their border radius, horizontal padding, and font size.',
    },
  },
};
