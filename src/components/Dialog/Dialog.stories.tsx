import type { Meta, StoryFn } from "@storybook/react";
import { CheckCircle2, Trash2, UserPlus } from "lucide-react";
import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { TextField } from "../TextField/TextField";
import styles from "./Dialog.module.css";

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'A composable dialog. Compose `Dialog.Header`, `Dialog.Body`, and `Dialog.Footer` inside a `Dialog` (nested in a `Modal`). The header places an optional featured `icon` beside the title and subtitle, and renders a close button in the dialog\'s top-right corner (`hideCloseButton` to opt out). Buttons with `slot="close"` dismiss the dialog.',
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryFn<typeof Dialog>;

export const Example: Story = (args) => (
  <div className={styles.dialogPreview}>
    <Dialog {...args}>
      <Dialog.Header
        icon={<CheckCircle2 size={20} />}
        title="Blog post published"
        subtitle="This blog post has been published. Team members will be able to edit this post."
      />
      <Dialog.Footer>
        <Button slot="close" variant="secondary">
          Cancel
        </Button>
        <Button slot="close">Confirm</Button>
      </Dialog.Footer>
    </Dialog>
  </div>
);

export const WithForm: Story = () => (
  <div className="dialog-preview">
    <Dialog>
      <Dialog.Header
        icon={<UserPlus size={20} />}
        title="Sign up"
        subtitle="Enter your details to create an account."
      />
      <Dialog.Body>
        <TextField
          autoFocus
          label="First Name"
          placeholder="Enter your first name"
        />
        <TextField label="Last Name" placeholder="Enter your last name" />
      </Dialog.Body>
      <Dialog.Footer>
        <Button slot="close" variant="secondary">
          Cancel
        </Button>
        <Button slot="close">Submit</Button>
      </Dialog.Footer>
    </Dialog>
  </div>
);

export const AlertDialog: Story = () => (
  <div className="dialog-preview">
    <Dialog>
      <Dialog.Header
        icon={<Trash2 size={20} />}
        title="Delete blog post"
        subtitle="Are you sure you want to delete this post? This action cannot be undone."
        hideCloseButton
      />
      <Dialog.Footer>
        <Button slot="close" variant="secondary">
          Cancel
        </Button>
        <Button slot="close">Delete</Button>
      </Dialog.Footer>
    </Dialog>
  </div>
);
