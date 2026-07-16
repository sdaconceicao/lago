import type { Meta, StoryFn } from "@storybook/react";
import { Button } from "@/components/Button/Button";
import { Heading } from "@/components/Content/Content";
import { DialogTrigger } from "@/components/Dialog/Dialog";
import { Sheet } from "./Sheet";

const meta: Meta<typeof Sheet> = {
  component: Sheet,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A slide-in panel anchored to the edge of the screen, built on top of a Modal overlay and Dialog. Compose it inside a `DialogTrigger` alongside a trigger element. Content is provided as children and rendered through a `Dialog`.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Sheet>;

export const Example: Story = (args) => (
  <DialogTrigger>
    <Button>Open sheet</Button>
    <Sheet {...args}>
      <Heading slot="title">Settings</Heading>
      <p>Content for the slide-in sheet goes here.</p>
      <Button slot="close">Close</Button>
    </Sheet>
  </DialogTrigger>
);
