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

export const Disabled: Story = (args) => (
  <DropZone {...args} isDisabled style={{ width: 320, height: 160 }}>
    <Text>Uploads are disabled</Text>
  </DropZone>
);
