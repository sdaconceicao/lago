import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
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
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
    onKeyUp: fn(),
  },
};

export default meta;
type Story = StoryFn<typeof ColorField>;

export const Example: Story = (args) => <ColorField {...args} />;

Example.args = {
  label: "Color",
};

export const Sizes: Story = (args) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      width: 240,
    }}
  >
    <ColorField {...args} size="sm" label="Small" />
    <ColorField {...args} size="md" label="Medium (default)" />
    <ColorField {...args} size="lg" label="Large" />
  </div>
);

Sizes.args = {
  defaultValue: "#7f00ff",
};

Sizes.parameters = {
  docs: {
    description: {
      story:
        'The size prop scales the field: "sm" is a compact 28px-tall input with 12px text, "md" (the default) is 36px tall with 14px text, and "lg" is a roomy 48px with 14px text. All three match the TextField and the other field controls at the same size, so they line up when placed in a row.',
    },
  },
};
