import type { Meta, StoryFn } from "@storybook/react";
import { HelpCircle } from "lucide-react";
import { Button } from "../Button/Button";
import { Heading } from "../Content/Content";
import { DialogTrigger } from "../Dialog/Dialog";
import { Popover } from "./Popover";

const meta: Meta<typeof Popover> = {
  component: Popover,
  parameters: {
    layout: "centered",
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
