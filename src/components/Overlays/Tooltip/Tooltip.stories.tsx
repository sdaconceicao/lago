import type { Meta, StoryFn } from "@storybook/react";
import { Save } from "lucide-react";
import { fn } from "storybook/test";
import { IconButton } from "@/components/Actions/IconButton/IconButton";
import { Tooltip, TooltipTrigger } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A small popover that displays brief, non-interactive contextual information about an element, typically on hover, focus, or press. Wrap a trigger (such as a Button or link) in a TooltipTrigger to associate it with the Tooltip.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    onOpenChange: fn(),
  },
};

export default meta;

type Story = StoryFn<typeof Tooltip>;

export const Example: Story = (args) => (
  <TooltipTrigger>
    <IconButton aria-label="Save">
      <Save size={18} />
    </IconButton>
    <Tooltip {...args}>Save</Tooltip>
  </TooltipTrigger>
);
