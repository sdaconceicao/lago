import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button/Button";
import { Dialog, DialogTrigger } from "../Dialog/Dialog";
import { Popover, type PopoverProps } from "./Popover";

const renderPopover = (props: Partial<PopoverProps> = {}) =>
  render(
    <DialogTrigger>
      <Button>Help</Button>
      <Popover {...props}>
        <Dialog>
          <p>Popover content</p>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );

describe("Popover", () => {
  it("is not rendered until the trigger is pressed", () => {
    renderPopover();

    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
  });

  it("opens when the trigger is pressed", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button", { name: "Help" }));

    expect(await screen.findByText("Popover content")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("merges a custom className with the react-aria-Popover class", async () => {
    const user = userEvent.setup();
    renderPopover({ className: "custom-popover" });

    await user.click(screen.getByRole("button", { name: "Help" }));
    await screen.findByText("Popover content");

    const popover = document.querySelector(".react-aria-Popover");
    expect(popover).not.toBeNull();
    expect(popover).toHaveClass("custom-popover");
  });

  it("renders an overlay arrow by default", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button", { name: "Help" }));
    await screen.findByText("Popover content");

    expect(document.querySelector(".react-aria-OverlayArrow")).not.toBeNull();
  });

  it("hides the arrow when hideArrow is set", async () => {
    const user = userEvent.setup();
    renderPopover({ hideArrow: true });

    await user.click(screen.getByRole("button", { name: "Help" }));
    await screen.findByText("Popover content");

    expect(document.querySelector(".react-aria-OverlayArrow")).toBeNull();
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button", { name: "Help" }));
    await screen.findByText("Popover content");

    await user.keyboard("{Escape}");

    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
  });

  it("closes when interacting outside", async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole("button", { name: "Help" }));
    await screen.findByText("Popover content");

    await user.click(document.body);

    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
  });

  it("notifies the trigger of open state changes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <DialogTrigger onOpenChange={onOpenChange}>
        <Button>Help</Button>
        <Popover>
          <Dialog>
            <p>Popover content</p>
          </Dialog>
        </Popover>
      </DialogTrigger>
    );

    await user.click(screen.getByRole("button", { name: "Help" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
