import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DialogProps } from "react-aria-components/Dialog";
import type { DialogTriggerProps } from "react-aria-components/Dialog";
import { Button } from "../Button/Button";
import { Modal } from "../Modal/Modal";
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
          <Heading slot="title">Sign up</Heading>
          <p>Dialog body</p>
          <Button slot="close">Close</Button>
        </Dialog>
      </Modal>
    </DialogTrigger>
  );

describe("Dialog", () => {
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

  it("labels the dialog with the slotted heading", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(await screen.findByRole("dialog")).toHaveAccessibleName("Sign up");
  });

  it("closes the dialog via a slot=close button", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Open dialog" }));
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("supports defaultOpen on the trigger", () => {
    renderDialog({}, { defaultOpen: true });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
