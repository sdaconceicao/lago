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

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <ColorPicker {...args} size="sm" label="Small" />
    <ColorPicker {...args} size="md" label="Medium (default)" />
  </div>
);

Sizes.args = {
  defaultValue: "#f00",
};

Sizes.parameters = {
  docs: {
    description: {
      story:
        'The size prop scales the trigger swatch and label and is passed on to the popover, so the hex ColorField inside is compact too: "sm" pairs a 20px swatch with 12px text, "md" (the default) a 32px swatch with 14px text, matching the inner controls of same-size fields.',
    },
  },
};
