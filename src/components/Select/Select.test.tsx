import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select, SelectItem } from "./Select";

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

const renderSelect = (props = {}) =>
  render(
    <Select label="Ice cream flavor" {...props}>
      <SelectItem id="chocolate">Chocolate</SelectItem>
      <SelectItem id="mint">Mint</SelectItem>
      <SelectItem id="strawberry">Strawberry</SelectItem>
      <SelectItem id="vanilla">Vanilla</SelectItem>
    </Select>
  );

describe("Select", () => {
  it("renders a labeled trigger button with a placeholder value", () => {
    renderSelect();

    const trigger = screen.getByRole("button", { name: /Ice cream flavor/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Select an item");
  });

  it("opens a listbox with all options when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderSelect();

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Ice cream flavor/i }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(4);
    expect(options.map((o) => o.textContent)).toEqual([
      "Chocolate",
      "Mint",
      "Strawberry",
      "Vanilla",
    ]);
  });

  it("selects an option, closes the listbox and calls onSelectionChange", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderSelect({ onSelectionChange });

    await user.click(screen.getByRole("button", { name: /Ice cream flavor/i }));
    await user.click(screen.getByRole("option", { name: "Mint" }));

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith("mint");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Ice cream flavor/i })
    ).toHaveTextContent("Mint");
  });

  it("renders the selected value for defaultSelectedKey", () => {
    renderSelect({ defaultSelectedKey: "strawberry" });

    expect(
      screen.getByRole("button", { name: /Ice cream flavor/i })
    ).toHaveTextContent("Strawberry");
  });

  it("marks disabled options and prevents selecting them", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderSelect({ disabledKeys: ["mint"], onSelectionChange });

    await user.click(screen.getByRole("button", { name: /Ice cream flavor/i }));

    const mint = screen.getByRole("option", { name: "Mint" });
    expect(mint).toHaveAttribute("aria-disabled", "true");

    await user.click(mint);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("supports keyboard selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderSelect({ onSelectionChange });

    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Opening with the keyboard focuses the first option; ArrowDown moves
    // to the second one.
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSelectionChange).toHaveBeenCalledWith("mint");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders a description when provided", () => {
    renderSelect({ description: "Pick your favorite" });

    expect(screen.getByText("Pick your favorite")).toBeInTheDocument();
  });

  it("renders an error message when invalid", () => {
    renderSelect({ isInvalid: true, errorMessage: "Flavor is required" });

    expect(screen.getByText("Flavor is required")).toBeInTheDocument();
  });
});
