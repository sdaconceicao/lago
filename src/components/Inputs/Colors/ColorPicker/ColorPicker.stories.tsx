import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { ColorPicker } from "./ColorPicker";

const meta: Meta<typeof ColorPicker> = {
  component: ColorPicker,
  args: {
    onChange: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A full-featured color selection control that combines a ColorArea, ColorSlider(s), a ColorSwatch, and a ColorField. ColorPicker lets the user choose a color across channels (hue, saturation, lightness, alpha) using multiple coordinated inputs.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof ColorPicker>;

export const Example: Story = (args) => <ColorPicker {...args} />;

Example.args = {
  label: "Fill color",
  defaultValue: "#f00",
};
