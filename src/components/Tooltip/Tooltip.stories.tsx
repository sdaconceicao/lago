import type { Meta, StoryFn } from "@storybook/react";
import { Save } from "lucide-react";
import { Button } from "@/components/Button/Button";
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
};

export default meta;

type Story = StoryFn<typeof Tooltip>;

export const Example: Story = (args) => (
  <TooltipTrigger>
    <Button>
      <Save size={18} />
    </Button>
    <Tooltip {...args}>Save</Tooltip>
  </TooltipTrigger>
);
