import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header, ListBox, ListBoxItem, ListBoxSection } from "./ListBox";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const renderListBox = (props = {}) =>
  render(
    <ListBox aria-label="Ice cream flavor" {...props}>
      <ListBoxItem id="chocolate">Chocolate</ListBoxItem>
      <ListBoxItem id="mint">Mint</ListBoxItem>
      <ListBoxItem id="strawberry">Strawberry</ListBoxItem>
      <ListBoxItem id="vanilla">Vanilla</ListBoxItem>
    </ListBox>
  );

describe("ListBox", () => {
  it("renders a listbox with an accessible name and all options", () => {
    renderListBox();

    expect(
      screen.getByRole("listbox", { name: "Ice cream flavor" })
    ).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(4);
    expect(options.map((o) => o.textContent)).toEqual([
      "Chocolate",
      "Mint",
      "Strawberry",
      "Vanilla",
    ]);
  });

  it("supports single selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderListBox({ selectionMode: "single", onSelectionChange });

    await user.click(screen.getByRole("option", { name: "Mint" }));

    expect(screen.getByRole("option", { name: "Mint" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect([...onSelectionChange.mock.calls[0][0]]).toEqual(["mint"]);
  });

  it("supports multiple selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderListBox({ selectionMode: "multiple", onSelectionChange });

    await user.click(screen.getByRole("option", { name: "Chocolate" }));
    await user.click(screen.getByRole("option", { name: "Vanilla" }));

    expect(screen.getByRole("option", { name: "Chocolate" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("option", { name: "Vanilla" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect([...onSelectionChange.mock.calls[1][0]]).toEqual([
      "chocolate",
      "vanilla",
    ]);
  });

  it("marks disabled options and prevents selecting them", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderListBox({
      selectionMode: "single",
      disabledKeys: ["strawberry"],
      onSelectionChange,
    });

    const strawberry = screen.getByRole("option", { name: "Strawberry" });
    expect(strawberry).toHaveAttribute("aria-disabled", "true");

    await user.click(strawberry);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("calls onAction when an item is actioned", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderListBox({ onAction });

    await user.click(screen.getByRole("option", { name: "Vanilla" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("vanilla");
  });

  it("supports keyboard navigation and selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderListBox({ selectionMode: "single", onSelectionChange });

    await user.tab();
    expect(screen.getByRole("option", { name: "Chocolate" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Mint" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect([...onSelectionChange.mock.calls[0][0]]).toEqual(["mint"]);
  });

  it("renders sections with headers", () => {
    render(
      <ListBox aria-label="Sandwich contents" selectionMode="multiple">
        <ListBoxSection id="veggies">
          <Header>Veggies</Header>
          <ListBoxItem id="lettuce">Lettuce</ListBoxItem>
          <ListBoxItem id="tomato">Tomato</ListBoxItem>
        </ListBoxSection>
        <ListBoxSection id="protein">
          <Header>Protein</Header>
          <ListBoxItem id="ham">Ham</ListBoxItem>
          <ListBoxItem id="tofu">Tofu</ListBoxItem>
        </ListBoxSection>
      </ListBox>
    );

    const groups = screen.getAllByRole("group");
    expect(groups).toHaveLength(2);
    expect(within(groups[0]).getByText("Veggies")).toBeInTheDocument();
    expect(within(groups[1]).getByText("Protein")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("uses the item's string children as its text value", async () => {
    const user = userEvent.setup();
    renderListBox({ selectionMode: "single" });

    await user.tab();
    // Typeahead should move focus based on the derived textValue.
    await user.keyboard("vani");

    expect(screen.getByRole("option", { name: "Vanilla" })).toHaveFocus();
  });
});
