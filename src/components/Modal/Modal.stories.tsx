import type { Meta, StoryFn } from "@storybook/react";
import { Button } from "../Button/Button";
import { Heading } from "../Content/Content";
import { Dialog, DialogTrigger } from "../Dialog/Dialog";
import { TextField } from "../Inputs/TextField/TextField";
import { Modal } from "../Modal/Modal";

const meta: Meta<typeof Modal> = {
  component: Modal,
  parameters: {
    layout: "centered",
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
