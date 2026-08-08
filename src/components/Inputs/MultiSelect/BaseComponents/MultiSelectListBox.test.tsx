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

  it("sets the toolbar data attribute when allowsSelectAll is true", async () => {
    const user = userEvent.setup();
    renderMultiSelectListBox({ allowsSelectAll: true });

    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toHaveAttribute("data-multi-select-toolbar", "true");
  });

  it("does not set the toolbar data attribute when allowsSelectAll is false", async () => {
    const user = userEvent.setup();
    renderMultiSelectListBox();

    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    expect(listbox).not.toHaveAttribute("data-multi-select-toolbar");
  });
});
