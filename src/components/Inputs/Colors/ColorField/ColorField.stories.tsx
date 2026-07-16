import type { Meta, StoryFn } from "@storybook/react";
import { ColorField } from "./ColorField";

const meta: Meta<typeof ColorField> = {
  component: ColorField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A text input that lets the user enter a color value in a supported format (such as hex or RGB). ColorField pairs with a color picker or swatch when available, validates the entered value, and supports a label and placeholder.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    placeholder: "Enter a color",
  },
};

export default meta;
type Story = StoryFn<typeof ColorField>;

export const Example: Story = (args) => <ColorField {...args} />;

Example.args = {
  label: "Color",
};
