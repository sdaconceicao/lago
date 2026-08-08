import { render, screen, within } from "@testing-library/react";
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

describe("MultiSelectTags", () => {
  it("renders nothing when there are no selected items", () => {
    const { container } = render(
      <MultiSelect label="Fruits">
        <MultiSelectItem id="apple">Apple</MultiSelectItem>
      </MultiSelect>
    );

    expect(container.querySelectorAll(".react-aria-Tag")).toHaveLength(0);
  });

  it("renders a tag for each selected item", () => {
    const { container } = render(
      <MultiSelect label="Fruits" defaultValue={["apple", "banana"]}>
        <MultiSelectItem id="apple">Apple</MultiSelectItem>
        <MultiSelectItem id="banana">Banana</MultiSelectItem>
      </MultiSelect>
    );

    const tags = container.querySelectorAll(".react-aria-Tag");
    expect(tags).toHaveLength(2);
    expect(tags[0]).toHaveTextContent("Apple");
    expect(tags[1]).toHaveTextContent("Banana");
  });

  it("removes a tag when its remove button is clicked", async () => {
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

    const appleRow = screen.getByRole("row", { name: "Apple" });
    await user.click(within(appleRow).getByRole("button"));

    expect(onChange).toHaveBeenLastCalledWith(["banana"]);
  });
});
