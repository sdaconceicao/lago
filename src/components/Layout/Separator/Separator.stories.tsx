import type { Meta, StoryFn } from "@storybook/react";
import { Separator } from "./Separator";

const meta: Meta<typeof Separator> = {
  component: Separator,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A visual divider that separates and distinguishes sections of content or groups of menu items. Set `orientation` to `horizontal` or `vertical`, and provide an `aria-label` for accessibility.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Separator>;

export const Horizontal: Story = (args) => (
  <div style={{ maxWidth: 320 }}>
    <p>Section one</p>
    <Separator {...args} />
    <p>Section two</p>
  </div>
);

Horizontal.args = {
  orientation: "horizontal",
};

export const Vertical: Story = (args) => (
  <div style={{ display: "flex", height: 48, alignItems: "center", gap: 12 }}>
    <span>One</span>
    <Separator {...args} />
    <span>Two</span>
  </div>
);

Vertical.args = {
  orientation: "vertical",
};
