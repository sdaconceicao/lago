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
          "An icon-only ToggleButton with equal width and height and the same corner radius as ToggleButton. It reuses ToggleButton's selection, keyboard interaction, variants and disabled behavior, adding square sizing and a required accessible name. ToggleButtonGroup supplies segmented corners when grouped. Use ToggleButton for visible text labels and IconButton for actions without a selected state.",
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

export const Default: Story = (args) => (
  <IconToggleButton {...args}>
    <Bold />
  </IconToggleButton>
);

Default.args = {
  "aria-label": "Bold",
  size: "md",
  variant: "primary",
};

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

Sizes.parameters = {
  docs: {
    description: {
      story:
        "Small, medium and large icon toggles are 28px, 36px and 48px square. Each uses ToggleButton's corner radius for its size.",
    },
  },
};

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

Variants.parameters = {
  docs: {
    description: {
      story:
        "Primary, secondary and quiet variants reuse ToggleButton's styling while keeping the icon-only square dimensions.",
    },
  },
};

export const States: Story = () => (
  <Row>
    <IconToggleButton aria-label="Bold">
      <Bold />
    </IconToggleButton>
    <IconToggleButton aria-label="Italic" defaultSelected>
      <Italic />
    </IconToggleButton>
    <IconToggleButton aria-label="Bold disabled" isDisabled>
      <Bold />
    </IconToggleButton>
  </Row>
);

States.parameters = {
  docs: {
    description: {
      story:
        "Unselected, selected and disabled controls retain the same square dimensions and rounded corners. Selection is exposed through aria-pressed.",
    },
  },
};

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

InAGroup.parameters = {
  docs: {
    description: {
      story:
        "A single-selection alignment group gives icon toggles segmented corners and manages selection and keyboard navigation through ToggleButtonGroup.",
    },
  },
};
