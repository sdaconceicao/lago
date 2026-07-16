import type { Meta, StoryFn } from "@storybook/react";
import { Group } from "react-aria-components/Group";
import { Button } from "../Button/Button";
import { Checkbox } from "../Inputs/Checkbox/Checkbox";
import { ToggleButton } from "../Inputs/Toggle/ToggleButton/ToggleButton";
import { Separator } from "../Separator/Separator";
import { Toolbar } from "../Toolbar/Toolbar";

const meta: Meta<typeof Toolbar> = {
  component: Toolbar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof Toolbar>;

export const Example: Story = (args) => (
  <Toolbar aria-label="Text formatting" {...args}>
    <Group aria-label="Style">
      <ToggleButton aria-label="Bold">
        <b>B</b>
      </ToggleButton>
      <ToggleButton aria-label="Italic">
        <i>I</i>
      </ToggleButton>
      <ToggleButton aria-label="Underline">
        <u>U</u>
      </ToggleButton>
    </Group>
    <Separator />
    <Group aria-label="Clipboard">
      <Button>Copy</Button>
      <Button>Paste</Button>
      <Button>Cut</Button>
    </Group>
    <Separator />
    <Checkbox>Night Mode</Checkbox>
  </Toolbar>
);
