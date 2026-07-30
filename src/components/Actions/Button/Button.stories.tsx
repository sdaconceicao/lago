import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  component: Button,
  args: {
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
          "A clickable element used to trigger an action or event, such as submitting a form or opening a dialog. Buttons support variations like primary, secondary, and quiet styles, and can include icons or other content.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Button>;

export const Example: Story = (args) => <Button {...args}>Press me</Button>;

Example.args = {
  onPress: () => alert("Hello world!"),
};

export const Variants: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="quiet">
        Quiet
      </Button>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Button {...args} variant="info">
        Info
      </Button>
      <Button {...args} variant="success">
        Success
      </Button>
      <Button {...args} variant="warning">
        Warning
      </Button>
      <Button {...args} variant="error">
        Error
      </Button>
    </div>
  </div>
);

Variants.parameters = {
  docs: {
    description: {
      story:
        'Variants fall into two groups. The first row ranks a button by emphasis and takes the theme tint: "primary" (the default) is a soft raised button, "secondary" swaps the tint for grey, and "quiet" drops the fill until hovered. The second row is the semantic tones — "info", "success", "warning" and "error" — for the action that resolves a state, such as retrying a failed request or confirming a delete. A tone renders as a solid fill of its hue rather than a soft tint, because a toned button is usually placed on a surface already tinted with the same hue, such as an Alert of the matching variant, where the soft treatment would dissolve into the background and end up ranking below a grey secondary beside it. The fill and its focus ring use fixed lightness steps, so a tone reads the same in both themes; under forced colours every variant falls back to the system button palette.',
    },
  },
};

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
    <Button {...args} size="sm">
      Small
    </Button>
    <Button {...args} size="md">
      Medium (default)
    </Button>
    <Button {...args} size="lg">
      Large
    </Button>
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'Button supports three sizes: "sm" is 28px tall with 12px text and 12px icons, "md" (the default) is 36px tall with 14px text, 12px horizontal padding and 14px icons, and "lg" is 48px tall with 16px text, 16px horizontal padding and 16px icons. The control scale mirrors the field scale numerically, so the steps line up step for step: `size="md"` is exactly as tall as a default 36px field, "sm" matches a "sm" field and "lg" a "lg" field. Give a button the same `size` as the fields it shares a row with and it will align — there is no pairing table to remember. Unlike a field, a Button carries its own scale: it renders `data-size` rather than `data-field-size` and ignores the field custom properties entirely, so a button inside a compact field, dialog footer, or toolbar keeps the size you asked for instead of shrinking with its surroundings.',
    },
  },
};
