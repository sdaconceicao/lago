import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import { DropZone, Text } from "./DropZone";

const meta: Meta<typeof DropZone> = {
  component: DropZone,
  args: {
    onDrop: fn(),
    onDropEnter: fn(),
    onDropExit: fn(),
    onDropMove: fn(),
    onDropActivate: fn(),
    onHoverStart: fn(),
    onHoverEnd: fn(),
    onHoverChange: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A drop target that accepts files via drag and drop. Use the `getDropOperation` and `onDrop` props to handle dropped items, and render `Text` inside to provide instructions.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof DropZone>;

export const Example: Story = (args) => (
  <DropZone {...args} style={{ width: 320, height: 160 }}>
    <Text>Drag files here to upload</Text>
  </DropZone>
);

export const Sizes: Story = (args) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <DropZone {...args} size="sm" style={{ width: 320 }}>
      <Text>Small — drag files here</Text>
    </DropZone>
    <DropZone {...args} size="md" style={{ width: 320 }}>
      <Text>Medium (default) — drag files here</Text>
    </DropZone>
  </div>
);

Sizes.parameters = {
  docs: {
    description: {
      story:
        'DropZone supports two sizes: "sm" renders a compact target with 12px text, 8px/12px padding, a 48px minimum height, and a 6px radius, and "md" (the default) keeps the roomier 24px/12px padding, 96px minimum height, and 16px text. The size follows the field scale, so a DropZone inside a `<Form size="sm">` becomes compact along with the fields around it. Unlike a TextField or Select, a DropZone is a box target rather than a single-line control, so it will never row-align with the fields beside it — only its type size, padding, and radius track the field scale.',
    },
  },
};

export const Disabled: Story = (args) => (
  <DropZone {...args} isDisabled style={{ width: 320, height: 160 }}>
    <Text>Uploads are disabled</Text>
  </DropZone>
);
