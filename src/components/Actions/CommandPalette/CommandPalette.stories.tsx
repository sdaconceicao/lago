import type { Meta, StoryFn } from "@storybook/react";
import { Button } from "@/components/Actions/Button/Button";
import { MenuItem } from "@/components/Actions/Menu/Menu";
import { DialogTrigger } from "@/components/Overlays/Dialog/Dialog";
import { CommandPalette } from "./CommandPalette";

const meta: Meta<typeof CommandPalette> = {
  component: CommandPalette,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A dialog with a searchable list of commands or actions that the user can quickly filter and run, commonly invoked with a keyboard shortcut. It typically combines an input field with a Menu of actions and is opened from a DialogTrigger.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof CommandPalette>;

export const Example: Story = (args) => (
  <DialogTrigger>
    <Button>
      Open Command Palette <kbd>⌘ J</kbd>
    </Button>
    <CommandPalette {...args}>
      <MenuItem>Create new file...</MenuItem>
      <MenuItem>Create new folder...</MenuItem>
      <MenuItem>Assign to...</MenuItem>
      <MenuItem>Assign to me</MenuItem>
      <MenuItem>Change status...</MenuItem>
      <MenuItem>Change priority...</MenuItem>
      <MenuItem>Add label...</MenuItem>
      <MenuItem>Remove label...</MenuItem>
    </CommandPalette>
  </DialogTrigger>
);
