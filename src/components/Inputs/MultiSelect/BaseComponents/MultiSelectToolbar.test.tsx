import { render, screen } from "@testing-library/react";
import { ListBox, ListBoxItem } from "@/components/Collections/ListBox/ListBox";
import {
  SELECT_ALL_KEY,
  SELECT_NONE_KEY,
} from "@/components/Inputs/MultiSelect/MultiSelect.utils";
import { MultiSelectToolbar } from "./MultiSelectToolbar";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const renderToolbar = (toolbarProps = {}, listBoxProps = {}) =>
  render(
    <ListBox aria-label="Options" selectionMode="multiple" {...listBoxProps}>
      <MultiSelectToolbar
        selectAllLabel="Select all"
        selectNoneLabel="Select none"
        {...toolbarProps}
      />
      <ListBoxItem id="apple">Apple</ListBoxItem>
      <ListBoxItem id="banana">Banana</ListBoxItem>
    </ListBox>
  );

describe("MultiSelectToolbar", () => {
  it("renders the select all control", () => {
    renderToolbar();

    const selectAll = screen.getByRole("option", { name: "Select all" });
    expect(selectAll).toBeInTheDocument();
    expect(selectAll).toHaveAttribute("id", expect.stringContaining(SELECT_ALL_KEY));
  });

  it("renders the select none control", () => {
    renderToolbar();

    const selectNone = screen.getByRole("option", { name: "Select none" });
    expect(selectNone).toBeInTheDocument();
    expect(selectNone).toHaveAttribute("id", expect.stringContaining(SELECT_NONE_KEY));
  });

  it("renders controls with custom labels", () => {
    renderToolbar({
      selectAllLabel: "All",
      selectNoneLabel: "None",
    });

    expect(screen.getByRole("option", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "None" })).toBeInTheDocument();
  });

  it("applies the toolbar CSS class", () => {
    renderToolbar();

    const controls = screen.getAllByRole("option").filter((option) =>
      option.classList.contains("multi-select-control")
    );
    expect(controls).toHaveLength(2);
  });
});
