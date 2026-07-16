import type { Meta, StoryFn } from "@storybook/react";
import { Group } from "react-aria-components/Group";
import { Button } from "@/components/Actions/Button/Button";
import { Checkbox } from "@/components/Inputs/Checkbox/Checkbox";
import { ToggleButton } from "@/components/Inputs/Toggle/ToggleButton/ToggleButton";
import { Separator } from "@/components/Separator/Separator";
import { Toolbar } from "./Toolbar";

const meta: Meta<typeof Toolbar> = {
  component: Toolbar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A container for grouping a set of related interactive controls, such as buttons, toggles, and checkboxes. Toolbar manages keyboard navigation (arrow keys) and roving focus between its items, and can be divided into groups with separators.",
      },
    },
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
