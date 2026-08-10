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

const renderMultiSelectListBox = (props = {}) =>
  render(
    <MultiSelect label="Fruits" {...props}>
      <MultiSelectItem id="apple">Apple</MultiSelectItem>
      <MultiSelectItem id="banana">Banana</MultiSelectItem>
    </MultiSelect>
  );

describe("MultiSelectListBox", () => {
  it("renders a dropdown listbox", async () => {
    const user = userEvent.setup();
    renderMultiSelectListBox();

    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
  });

  it("marks the listbox as multi-selectable", async () => {
    const user = userEvent.setup();
    renderMultiSelectListBox();

    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByRole("listbox")).toHaveAttribute(
      "aria-multiselectable",
      "true"
    );
  });

  it("holds only the options, even with the selection toolbar on", async () => {
    const user = userEvent.setup();
    renderMultiSelectListBox({ allowsSelectAll: true });

    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");

    expect(
      Array.from(listbox.querySelectorAll('[role="option"]')).map(
        (option) => option.textContent
      )
    ).toEqual(["Apple", "Banana"]);
    expect(listbox.querySelector("button")).toBeNull();
  });

  it("shows the empty state when no option matches, toolbar or not", async () => {
    const user = userEvent.setup();
    renderMultiSelectListBox({ allowsSelectAll: true });

    await user.type(screen.getByRole("combobox"), "zzz");

    expect(await screen.findByText("No results found.")).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Apple" })
    ).not.toBeInTheDocument();
  });
});
