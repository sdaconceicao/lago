import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ModalOverlayProps } from "react-aria-components/Modal";
import { Button } from "@/components/Button/Button";
import { Dialog, DialogTrigger } from "@/components/Dialog/Dialog";
import { Modal } from "./Modal";

const renderModal = (props: Partial<ModalOverlayProps> = {}) =>
  render(
    <Modal {...props}>
      <Dialog>
        <p>Modal content</p>
      </Dialog>
    </Modal>
  );

describe("Modal", () => {
  it("renders nothing when closed", () => {
    renderModal({ isOpen: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders its content in a dialog when open", () => {
    renderModal({ isOpen: true });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("supports defaultOpen for uncontrolled usage", () => {
    renderModal({ defaultOpen: true });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls onOpenChange with false when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderModal({ isOpen: true, onOpenChange });

    await user.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not dismiss on Escape when isKeyboardDismissDisabled", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderModal({
      isOpen: true,
      onOpenChange,
      isKeyboardDismissDisabled: true,
    });

    await user.keyboard("{Escape}");

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("dismisses when clicking the underlay if isDismissable", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderModal({ isOpen: true, onOpenChange, isDismissable: true });

    const underlay = document.querySelector(".react-aria-ModalOverlay");
    expect(underlay).not.toBeNull();
    await user.click(underlay as Element);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not dismiss on underlay click by default", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderModal({ isOpen: true, onOpenChange });

    const underlay = document.querySelector(".react-aria-ModalOverlay");
    await user.click(underlay as Element);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens from a DialogTrigger", async () => {
    const user = userEvent.setup();
    render(
      <DialogTrigger>
        <Button>Open modal</Button>
        <Modal>
          <Dialog>
            <p>Triggered content</p>
          </Dialog>
        </Modal>
      </DialogTrigger>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Triggered content")).toBeInTheDocument();
  });
});
