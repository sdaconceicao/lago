import type { Meta, StoryFn } from "@storybook/react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/Actions/Button/Button";
import { DialogTrigger } from "@/components/Dialog/Dialog";
import { Heading } from "@/components/Typography/index";
import { Popover } from "./Popover";

const meta: Meta<typeof Popover> = {
  component: Popover,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A non-modal floating container that appears anchored to a trigger element, often used to surface additional content or controls. Popovers are typically opened from a DialogTrigger and can contain headings, text, or interactive elements.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Popover>;

export const Example: Story = (args) => (
  <DialogTrigger>
    <Button aria-label="Help">
      <HelpCircle size={18} />
    </Button>
    <Popover {...args} className="react-aria-Popover popover-padding">
      <Heading slot="title">Help</Heading>
      <p>For help accessing your account, please contact support.</p>
    </Popover>
  </DialogTrigger>
);
