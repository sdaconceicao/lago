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

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <Switch {...args} size="sm" defaultSelected>
      Small
    </Switch>
    <Switch {...args} size="md" defaultSelected>
      Medium (default)
    </Switch>
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'Switch supports two sizes: "sm" scales the track, label text, and gap down so the control sits comfortably beside 28px-tall fields, and "md" (the default) is the standard control. A Switch is not a field box, so it does not share the height of a TextField, Select, or DatePicker and will not row-align with them — matching the size only keeps the type and control weight consistent across a compact form.',
    },
  },
};
