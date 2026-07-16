import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DialogProps } from "react-aria-components/Dialog";
import type { DialogTriggerProps } from "react-aria-components/Dialog";
import { Button } from "@/components/Actions/Button/Button";
import { Modal } from "@/components/Overlays/Modal/Modal";
import { Dialog, DialogTrigger, Heading } from "./Dialog";

const renderDialog = (
  dialogProps: Partial<DialogProps> = {},
  triggerProps: Partial<Omit<DialogTriggerProps, "children">> = {}
) =>
  render(
    <DialogTrigger {...triggerProps}>
      <Button>Open dialog</Button>
      <Modal>
        <Dialog {...dialogProps}>
          <Dialog.Header title="Sign up" subtitle="Enter your details" />
          <Dialog.Body>Dialog body</Dialog.Body>
          <Dialog.Footer>
            <Button slot="close" variant="secondary">
              Cancel
            </Button>
            <Button slot="close">Submit</Button>
          </Dialog.Footer>
        </Dialog>
      </Modal>
    </DialogTrigger>
  );

describe("Dialog", () => {
  it("exposes Header, Body, and Footer as compound components", () => {
    expect(Dialog.Header).toBeDefined();
    expect(Dialog.Body).toBeDefined();
    expect(Dialog.Footer).toBeDefined();
  });

  it("does not render the dialog before the trigger is pressed", () => {
    renderDialog();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Dialog body")).not.toBeInTheDocument();
  });

  it("opens the dialog when the trigger is pressed", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Dialog body")).toBeInTheDocument();
  });

  it("labels the dialog with the header title", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(await screen.findByRole("dialog")).toHaveAccessibleName("Sign up");
  });

  it("renders the header subtitle", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(await screen.findByText("Enter your details")).toBeInTheDocument();
  });

  it("closes the dialog via the header close button", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the dialog via a slot=close footer button", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("hides the header close button with hideCloseButton", async () => {
    const user = userEvent.setup();
    render(
      <DialogTrigger>
        <Button>Open dialog</Button>
        <Modal>
          <Dialog>
            <Dialog.Header title="Sign up" hideCloseButton />
          </Dialog>
        </Modal>
      </DialogTrigger>
    );

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Close" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Sign up").closest(".dialog-header")).toHaveClass(
      "dialog-header--no-close"
    );
  });

  it("reserves close button space unless hideCloseButton is set", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    const header = (await screen.findByText("Sign up")).closest(
      ".dialog-header"
    );
    expect(header).not.toHaveClass("dialog-header--no-close");
  });

  it("renders a featured icon in the header", async () => {
    const user = userEvent.setup();
    render(
      <DialogTrigger>
        <Button>Open dialog</Button>
        <Modal>
          <Dialog>
            <Dialog.Header title="Sign up" icon={<span>Icon</span>} />
          </Dialog>
        </Modal>
      </DialogTrigger>
    );

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    const icon = await screen.findByText("Icon");
    expect(icon.parentElement).toHaveClass("dialog-header-icon");
  });

  it("renders custom children in the header", async () => {
    const user = userEvent.setup();
    render(
      <DialogTrigger>
        <Button>Open dialog</Button>
        <Modal>
          <Dialog>
            <Dialog.Header title="Sign up">
              <span>Header extra</span>
            </Dialog.Header>
          </Dialog>
        </Modal>
      </DialogTrigger>
    );

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(await screen.findByText("Header extra")).toBeInTheDocument();
  });

  it("merges custom classNames on Body and Footer", async () => {
    const user = userEvent.setup();
    render(
      <DialogTrigger>
        <Button>Open dialog</Button>
        <Modal>
          <Dialog>
            <Dialog.Header title="Sign up" />
            <Dialog.Body className="custom-body">Body</Dialog.Body>
            <Dialog.Footer className="custom-footer">Footer</Dialog.Footer>
          </Dialog>
        </Modal>
      </DialogTrigger>
    );

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    const body = await screen.findByText("Body");
    expect(body).toHaveClass("dialog-body", "custom-body");
    expect(screen.getByText("Footer")).toHaveClass(
      "dialog-footer",
      "custom-footer"
    );
  });

  it("supports the alertdialog role", async () => {
    const user = userEvent.setup();
    renderDialog({ role: "alertdialog" });

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onOpenChange when opening and closing", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderDialog({}, { onOpenChange });

    await user.click(screen.getByRole("button", { name: "Open dialog" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("supports defaultOpen on the trigger", () => {
    renderDialog({}, { defaultOpen: true });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("supports controlled open state via isOpen on the trigger", () => {
    renderDialog({}, { isOpen: true });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("stays closed when isOpen is false on the trigger", () => {
    renderDialog({}, { isOpen: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("forwards a custom className to the dialog element", () => {
    renderDialog({ className: "custom-dialog" }, { defaultOpen: true });

    expect(screen.getByRole("dialog")).toHaveClass("custom-dialog");
  });

  it("re-exports the Heading primitive", () => {
    expect(Heading).toBeDefined();
  });
});
