import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MenuItem } from "@/components/Navigation/Menu/Menu";
import { CommandPalette } from "./CommandPalette";

interface HarnessProps {
  defaultOpen?: boolean;
  onOpenChange?: (isOpen?: boolean) => void;
  onAction?: (key: React.Key) => void;
}

function Harness({
  defaultOpen = false,
  onOpenChange,
  onAction,
}: HarnessProps) {
  const [isOpen, setOpen] = useState(defaultOpen);

  return (
    <CommandPalette
      aria-label="Commands"
      isOpen={isOpen}
      onOpenChange={(next) => {
        setOpen(!!next);
        onOpenChange?.(next);
      }}
      onAction={onAction}
    >
      <MenuItem id="new-file">Create new file...</MenuItem>
      <MenuItem id="new-folder">Create new folder...</MenuItem>
      <MenuItem id="assign-me">Assign to me</MenuItem>
      <MenuItem id="change-status">Change status...</MenuItem>
    </CommandPalette>
  );
}

describe("CommandPalette", () => {
  it("renders nothing while closed", () => {
    render(<Harness />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("renders a dialog with a focused search field when open", () => {
    render(<Harness defaultOpen />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const searchbox = screen.getByRole("searchbox", {
      name: "Search commands",
    });
    expect(searchbox).toHaveFocus();
  });

  it("lists all commands before any filtering", () => {
    render(<Harness defaultOpen />);

    expect(screen.getAllByRole("menuitem")).toHaveLength(4);
    expect(
      screen.getByRole("menuitem", { name: "Create new file..." })
    ).toBeInTheDocument();
  });

  it("filters commands as the user types", async () => {
    const user = userEvent.setup();
    render(<Harness defaultOpen />);

    await user.keyboard("folder");

    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("Create new folder...");
  });

  it("filters case-insensitively", async () => {
    const user = userEvent.setup();
    render(<Harness defaultOpen />);

    await user.keyboard("ASSIGN");

    expect(screen.getAllByRole("menuitem")).toHaveLength(1);
    expect(
      screen.getByRole("menuitem", { name: "Assign to me" })
    ).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Harness defaultOpen />);

    await user.keyboard("zzzz");

    expect(
      screen.queryByRole("menuitem", { name: "Create new file..." })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Assign to me" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("opens via the Ctrl+J shortcut", () => {
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);

    fireEvent.keyDown(document.body, { key: "j", ctrlKey: true });

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not open on plain j without a modifier", () => {
    render(<Harness />);

    fireEvent.keyDown(document.body, { key: "j" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Harness defaultOpen onOpenChange={onOpenChange} />);

    await user.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("invokes onAction when a command is selected", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<Harness defaultOpen onAction={onAction} />);

    await user.click(screen.getByRole("menuitem", { name: "Assign to me" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction.mock.calls[0][0]).toBe("assign-me");
  });
});
