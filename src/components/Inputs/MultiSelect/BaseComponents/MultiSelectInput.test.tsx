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

describe("MultiSelectInput", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(
      <MultiSelect label="Fruits" placeholder="Search fruits...">
        <MultiSelectItem id="apple">Apple</MultiSelectItem>
      </MultiSelect>
    );

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "placeholder",
      "Search fruits..."
    );
  });

  it("hides the placeholder when an item is selected", () => {
    render(
      <MultiSelect
        label="Fruits"
        placeholder="Search fruits..."
        defaultValue={["apple"]}
      >
        <MultiSelectItem id="apple">Apple</MultiSelectItem>
      </MultiSelect>
    );

    expect(screen.getByRole("combobox")).not.toHaveAttribute("placeholder");
  });

  it("removes the most recently selected item on Backspace when empty", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelect
        label="Fruits"
        defaultValue={["apple", "banana"]}
        onChange={onChange}
      >
        <MultiSelectItem id="apple">Apple</MultiSelectItem>
        <MultiSelectItem id="banana">Banana</MultiSelectItem>
      </MultiSelect>
    );

    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Backspace}");

    expect(onChange).toHaveBeenLastCalledWith(["apple"]);
  });

  it("removes all items with repeated Backspace", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelect
        label="Fruits"
        defaultValue={["apple", "banana"]}
        onChange={onChange}
      >
        <MultiSelectItem id="apple">Apple</MultiSelectItem>
        <MultiSelectItem id="banana">Banana</MultiSelectItem>
      </MultiSelect>
    );

    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Backspace}{Backspace}");

    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("does not remove items when the input has text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelect label="Fruits" defaultValue={["apple"]} onChange={onChange}>
        <MultiSelectItem id="apple">Apple</MultiSelectItem>
      </MultiSelect>
    );

    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "b");
    await user.keyboard("{Backspace}");

    expect(input).toHaveValue("");
    expect(onChange).not.toHaveBeenCalled();
  });
});
