import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  component: Switch,
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A toggle control that represents an on/off state, like a physical light switch. Switch is used for binary settings and differs from a checkbox in that it takes effect immediately rather than on form submission.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Switch>;

export const Example: Story = (args) => <Switch {...args}>Wi-Fi</Switch>;
