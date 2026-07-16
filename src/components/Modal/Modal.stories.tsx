import type { Meta, StoryFn } from "@storybook/react";
import { Button } from "@/components/Button/Button";
import { Heading } from "@/components/Content/Content";
import { Dialog, DialogTrigger } from "@/components/Dialog/Dialog";
import { TextField } from "@/components/Inputs/TextField/TextField";
import { Modal } from "./Modal";

const meta: Meta<typeof Modal> = {
  component: Modal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A focused, modal dialog overlay that sits on top of the page and requires user interaction before returning to the underlying content. Modals capture focus, block interaction with the rest of the page, and are typically wrapped in a Dialog containing a heading and controls.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Modal>;

export const Example: Story = (args) => (
  <DialogTrigger>
    <Button>Sign up…</Button>
    <Modal {...args}>
      <Dialog>
        <form>
          <Heading slot="title">Sign up</Heading>
          <TextField
            autoFocus
            label="First Name"
            placeholder="Enter your first name"
          />
          <TextField label="Last Name" placeholder="Enter your last name" />
          <Button slot="close">Submit</Button>
        </form>
      </Dialog>
    </Modal>
  </DialogTrigger>
);
