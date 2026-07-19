import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { ColorSwatchPicker, ColorSwatchPickerItem } from "./ColorSwatchPicker";

const meta: Meta<typeof ColorSwatchPicker> = {
  component: ColorSwatchPicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A set of selectable color swatches that lets the user pick from a predefined palette. Each ColorSwatchPickerItem represents a color, and the picker manages single or multiple selection and keyboard navigation among the swatches.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    onChange: fn(),
  },
};

export default meta;
type Story = StoryFn<typeof ColorSwatchPicker>;

export const Example: Story = (args) => (
  <ColorSwatchPicker {...args}>
    <ColorSwatchPickerItem color="#A00" />
    <ColorSwatchPickerItem color="#f80" />
    <ColorSwatchPickerItem color="#080" />
    <ColorSwatchPickerItem color="#08f" />
    <ColorSwatchPickerItem color="#088" />
    <ColorSwatchPickerItem color="#008" />
  </ColorSwatchPicker>
);
