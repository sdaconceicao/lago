import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MultiSelect,
  MultiSelectItem,
} from "@/components/Inputs/MultiSelect/MultiSelect";

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

// The toolbar reads the live ComboBox state, so it is exercised through the
// field rather than in isolation.
const renderToolbar = (props = {}) =>
  render(
    <MultiSelect label="Fruits" allowsSelectAll {...props}>
      <MultiSelectItem id="apple">Apple</MultiSelectItem>
      <MultiSelectItem id="banana">Banana</MultiSelectItem>
    </MultiSelect>
  );

const openDropdown = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("combobox"));
  await screen.findByRole("listbox");
};

describe("MultiSelectToolbar", () => {
  it("renders both controls as buttons in a toolbar", async () => {
    const user = userEvent.setup();
    renderToolbar();
    await openDropdown(user);

    const toolbar = screen.getByRole("toolbar", { name: "Selection" });
    expect(toolbar).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Select all" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Select none" })
    ).toBeInTheDocument();
  });

  it("renders the controls with custom labels", async () => {
    const user = userEvent.setup();
    renderToolbar({ selectAllLabel: "All", selectNoneLabel: "None" });
    await openDropdown(user);

    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "None" })).toBeInTheDocument();
  });

  it("keeps the controls out of the option list", async () => {
    const user = userEvent.setup();
    renderToolbar();
    await openDropdown(user);

    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Apple",
      "Banana",
    ]);
  });

  it("renders the toolbar in the popover, above the listbox", async () => {
    const user = userEvent.setup();
    const { container } = renderToolbar();
    await openDropdown(user);

    const toolbar = screen.getByRole("toolbar", { name: "Selection" });
    const listbox = screen.getByRole("listbox");
    const popover = listbox.closest(".react-aria-Popover");

    expect(popover).toContainElement(toolbar);
    expect(listbox).not.toContainElement(toolbar);
    expect(
      toolbar.compareDocumentPosition(listbox) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    // Portaled into the popover, not into the field's own container.
    expect(container.querySelector('[role="toolbar"]')).toBeNull();
  });

  it("moves the field's size onto the controls", async () => {
    const user = userEvent.setup();
    renderToolbar({ size: "sm" });
    await openDropdown(user);

    expect(screen.getByRole("button", { name: "Select all" })).toHaveAttribute(
      "data-size",
      "sm"
    );
  });

  it("disables select all once everything on offer is selected", async () => {
    const user = userEvent.setup();
    renderToolbar({ defaultValue: ["apple", "banana"] });
    await openDropdown(user);

    expect(screen.getByRole("button", { name: "Select all" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Select none" })).toBeEnabled();
  });

  it("disables select none while nothing on offer is selected", async () => {
    const user = userEvent.setup();
    renderToolbar();
    await openDropdown(user);

    expect(screen.getByRole("button", { name: "Select none" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Select all" })).toBeEnabled();
  });

  it("disables both controls when no option matches the filter", async () => {
    const user = userEvent.setup();
    renderToolbar({ defaultValue: ["apple"] });

    await user.type(screen.getByRole("combobox"), "zzz");
    await screen.findByText("No results found.");

    expect(screen.getByRole("button", { name: "Select all" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Select none" })).toBeDisabled();
  });

  it("moves between the controls with the arrow keys", async () => {
    const user = userEvent.setup();
    // Both enabled: a partial selection leaves each control something to do.
    renderToolbar({ defaultValue: ["apple"] });
    await openDropdown(user);

    await user.tab();
    expect(screen.getByRole("button", { name: "Select all" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Select none" })).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Select all" })).toHaveFocus();
  });

  it("returns focus to the search input on ArrowDown", async () => {
    const user = userEvent.setup();
    renderToolbar({ defaultValue: ["apple"] });
    const input = screen.getByRole("combobox");
    await openDropdown(user);

    await user.tab();
    expect(screen.getByRole("button", { name: "Select all" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");

    expect(input).toHaveFocus();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
