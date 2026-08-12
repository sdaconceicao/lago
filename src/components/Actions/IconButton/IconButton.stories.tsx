import type { Meta, StoryFn } from "@storybook/react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { fn } from "storybook/test";
import { IconButton } from "./IconButton";

const meta: Meta<typeof IconButton> = {
  component: IconButton,
  args: {
    onPress: fn(),
    "aria-label": "Close",
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A button whose whole content is an icon: square at the size given, with a fully round radius. It is a `Button` underneath, so every variant, size and state behaves identically — only the shape differs, and the accessible name is required, because an icon cannot supply one on its own. Reach for `Button` as soon as there is a visible label beside the icon; a labelled button should size to its text. For the trailing button inside a field — clear, reveal, a date picker's calendar trigger — use `FieldButton`.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof IconButton>;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
    {children}
  </div>
);

export const Example: Story = (args) => (
  <IconButton {...args}>
    <X />
  </IconButton>
);

export const Sizes: Story = () => (
  <Row>
    <IconButton aria-label="Dismiss" size="sm">
      <X />
    </IconButton>
    <IconButton aria-label="Dismiss" size="md">
      <X />
    </IconButton>
    <IconButton aria-label="Dismiss" size="lg">
      <X />
    </IconButton>
  </Row>
);

export const Variants: Story = () => (
  <Row>
    <IconButton aria-label="Confirm" variant="primary">
      <Check />
    </IconButton>
    <IconButton aria-label="Notifications" variant="secondary">
      <Bell />
    </IconButton>
    <IconButton aria-label="Dismiss" variant="quiet">
      <X />
    </IconButton>
    <IconButton aria-label="Delete" variant="error">
      <Trash2 />
    </IconButton>
  </Row>
);
