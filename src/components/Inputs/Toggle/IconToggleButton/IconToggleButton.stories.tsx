import type { Meta, StoryFn } from "@storybook/react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic } from "lucide-react";
import { fn } from "storybook/test";
import { ToggleButtonGroup } from "@/components/Inputs/Toggle/ToggleButtonGroup/ToggleButtonGroup";
import { IconToggleButton } from "./IconToggleButton";

const meta: Meta<typeof IconToggleButton> = {
  component: IconToggleButton,
  args: {
    onChange: fn(),
    "aria-label": "Bold",
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A toggle button whose whole content is an icon: square at the size given, with a fully round radius. It is a `ToggleButton` underneath, so every variant, size and state behaves identically — only the shape differs, and the accessible name is required, because an icon cannot supply one on its own. Inside a `ToggleButtonGroup` the group's segmented radii win, so it reads as one cell of the track. Reach for `ToggleButton` as soon as there is a visible label beside the icon.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof IconToggleButton>;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
    {children}
  </div>
);

export const Example: Story = (args) => (
  <IconToggleButton {...args}>
    <Bold />
  </IconToggleButton>
);

export const Sizes: Story = () => (
  <Row>
    <IconToggleButton aria-label="Bold" size="sm">
      <Bold />
    </IconToggleButton>
    <IconToggleButton aria-label="Bold" size="md">
      <Bold />
    </IconToggleButton>
    <IconToggleButton aria-label="Bold" size="lg">
      <Bold />
    </IconToggleButton>
  </Row>
);

export const Variants: Story = () => (
  <Row>
    <IconToggleButton aria-label="Bold" variant="primary">
      <Bold />
    </IconToggleButton>
    <IconToggleButton aria-label="Italic" variant="secondary">
      <Italic />
    </IconToggleButton>
    <IconToggleButton aria-label="Bold" variant="quiet">
      <Bold />
    </IconToggleButton>
  </Row>
);

/** In a group the segmented radii win, so the buttons read as one track. */
export const InAGroup: Story = () => (
  <ToggleButtonGroup aria-label="Text alignment" selectionMode="single">
    <IconToggleButton id="left" aria-label="Align left">
      <AlignLeft />
    </IconToggleButton>
    <IconToggleButton id="center" aria-label="Align centre">
      <AlignCenter />
    </IconToggleButton>
    <IconToggleButton id="right" aria-label="Align right">
      <AlignRight />
    </IconToggleButton>
  </ToggleButtonGroup>
);
