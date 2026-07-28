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
        'Button supports three sizes: "sm" is 28px tall with 12px text and 12px icons, "md" (the default) is 32px tall with 14px text, and "lg" is 48px tall with 16px horizontal padding and 16px icons. Sizes exist so a button can line up with the fields beside it: a row of "md" fields is 48px tall and pairs with `<Button size="lg">`, and a row of "sm" fields is 28px tall and pairs with `<Button size="sm">`. A plain `<Button>` is 32px tall and matches neither field height, so reach for "lg" or "sm" whenever a button shares a row with a field. Unlike a field, a Button carries its own scale — it renders `data-size` rather than `data-field-size` and ignores the field custom properties entirely, so a button inside a compact field, dialog footer, or toolbar keeps the size you asked for.',
    },
  },
};
