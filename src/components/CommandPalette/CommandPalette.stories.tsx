import type { Meta, StoryFn } from "@storybook/react";
import { Button } from "../Button/Button";
import { CommandPalette } from "../CommandPalette/CommandPalette";
import { DialogTrigger } from "../Dialog/Dialog";
import { MenuItem } from "../Menu/Menu";

const meta: Meta<typeof CommandPalette> = {
  component: CommandPalette,
  parameters: {
    layout: "centered",
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
