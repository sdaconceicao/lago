import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/Actions/Button/Button";
import { DialogTrigger } from "@/components/Dialog/Dialog";
import { Heading, Sheet } from "./Sheet";

const renderSheet = () =>
  render(
    <DialogTrigger>
      <Button>Open sheet</Button>
      <Sheet>
        <Heading slot="title">Sheet title</Heading>
        <p>Sheet body</p>
        <Button slot="close">Dismiss</Button>
      </Sheet>
    </DialogTrigger>
  );

describe("Sheet", () => {
  it("is closed until the trigger is pressed", () => {
    renderSheet();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Sheet body")).not.toBeInTheDocument();
  });

  it("opens as a dialog when the trigger is pressed", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Open sheet" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Sheet body")).toBeInTheDocument();
  });

  it("applies the sheet and sheet-overlay classes", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Open sheet" }));
    await screen.findByRole("dialog");

    expect(document.querySelector(".sheet-overlay")).not.toBeNull();
    expect(document.querySelector(".sheet")).not.toBeNull();
  });

  it("labels the dialog with the slotted heading", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Open sheet" }));

    expect(await screen.findByRole("dialog")).toHaveAccessibleName(
      "Sheet title"
    );
  });

  it("closes via a slot=close button", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Open sheet" }));
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.click(screen.getByRole("button", { name: "Open sheet" }));
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("notifies the trigger of open state changes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <DialogTrigger onOpenChange={onOpenChange}>
        <Button>Open sheet</Button>
        <Sheet>
          <p>Sheet body</p>
        </Sheet>
      </DialogTrigger>
    );

    await user.click(screen.getByRole("button", { name: "Open sheet" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
