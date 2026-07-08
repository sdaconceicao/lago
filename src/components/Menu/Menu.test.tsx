import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button/Button";
import { Menu, MenuItem, MenuTrigger, SubmenuTrigger } from "./Menu";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

const renderMenu = (props = {}) =>
  render(
    <MenuTrigger>
      <Button>Edit</Button>
      <Menu {...props}>
        <MenuItem id="favorite">Favorite</MenuItem>
        <MenuItem id="edit">Edit</MenuItem>
        <MenuItem id="delete">Delete</MenuItem>
      </Menu>
    </MenuTrigger>
  );

describe("Menu", () => {
  it("renders the trigger with the menu closed", () => {
    renderMenu();

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the menu with all items when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.textContent)).toEqual([
      "Favorite",
      "Edit",
      "Delete",
    ]);
  });

  it("calls onAction with the item key and closes the menu", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderMenu({ onAction });

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction.mock.calls[0][0]).toBe("delete");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("marks disabled items and does not trigger their action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderMenu({ onAction, disabledKeys: ["edit"] });

    await user.click(screen.getByRole("button", { name: "Edit" }));

    const editItem = screen.getByRole("menuitem", { name: "Edit" });
    expect(editItem).toHaveAttribute("aria-disabled", "true");

    await user.click(editItem);
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("supports single selection mode with menuitemradio items", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderMenu({ selectionMode: "single", onSelectionChange });

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getAllByRole("menuitemradio")).toHaveLength(3);

    await user.click(screen.getByRole("menuitemradio", { name: "Favorite" }));

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect([...onSelectionChange.mock.calls[0][0]]).toEqual(["favorite"]);
  });

  it("closes the menu on Escape", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens a submenu with the keyboard", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <MenuTrigger>
        <Button>Edit</Button>
        <Menu>
          <MenuItem id="favorite">Favorite</MenuItem>
          <SubmenuTrigger>
            <MenuItem id="share">Share</MenuItem>
            <Menu onAction={onAction}>
              <MenuItem id="sms">SMS</MenuItem>
              <MenuItem id="email">Email</MenuItem>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </MenuTrigger>
    );

    // Opening the menu focuses the first item; ArrowDown moves to Share.
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.keyboard("{ArrowDown}{ArrowRight}");

    expect(screen.getByRole("menuitem", { name: "SMS" })).toBeInTheDocument();

    await user.keyboard("{Enter}");
    expect(onAction.mock.calls[0][0]).toBe("sms");
  });

  it("supports keyboard navigation and activation", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderMenu({ onAction });

    // Opening the menu focuses the first item; ArrowDown moves to Edit.
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onAction.mock.calls[0][0]).toBe("edit");
  });
});
