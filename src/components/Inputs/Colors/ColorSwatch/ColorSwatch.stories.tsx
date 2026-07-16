import type { Meta, StoryFn } from "@storybook/react";
import { ColorSwatch } from "./ColorSwatch";

const meta: Meta<typeof ColorSwatch> = {
  component: ColorSwatch,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A small visual representation of a color, used to display, preview, or select a color value. ColorSwatch renders a filled square (optionally with rounding) and is commonly used within ColorPicker and ColorSwatchPicker.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof ColorSwatch>;

export const Example: Story = (args) => <ColorSwatch {...args} />;

Example.args = {
  color: "#f00a",
};
