import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { ToggleButton } from "./ToggleButton";

const meta: Meta<typeof ToggleButton> = {
  component: ToggleButton,
  args: {
    onChange: fn(),
    onPress: fn(),
    onPressStart: fn(),
    onPressEnd: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onHoverChange: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A button that can be toggled between pressed and unpressed (selected and unselected) states, similar to a checkbox but styled as a button. Often used in groups for mutually exclusive or multi-select options like text formatting.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof ToggleButton>;

export const Example: Story = (args) => (
  <ToggleButton {...args}>Pin</ToggleButton>
);
