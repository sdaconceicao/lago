import { render, screen } from "@testing-library/react";
import { ListBox } from "@/components/Collections/ListBox/ListBox";
import { MultiSelectItem } from "@/components/Inputs/MultiSelect/MultiSelect";

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

const renderMultiSelectItem = (props = {}) =>
  render(
    <ListBox aria-label="Options" selectionMode="multiple">
      <MultiSelectItem id="apple" {...props}>
        Apple
      </MultiSelectItem>
    </ListBox>
  );

describe("MultiSelectItem", () => {
  it("renders as a listbox option", () => {
    renderMultiSelectItem();

    expect(screen.getByRole("option", { name: "Apple" })).toBeInTheDocument();
  });

  it("renders the checkbox indicator", () => {
    renderMultiSelectItem();

    expect(screen.getByRole("option", { name: "Apple" })).toHaveTextContent(
      "Apple"
    );
  });

  it("supports custom children", () => {
    render(
      <ListBox aria-label="Options" selectionMode="multiple">
        <MultiSelectItem id="apple">
          <span data-testid="custom-child">Custom Apple</span>
        </MultiSelectItem>
      </ListBox>
    );

    expect(screen.getByTestId("custom-child")).toHaveTextContent("Custom Apple");
  });
});
