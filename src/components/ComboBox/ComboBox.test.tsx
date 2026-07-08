import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComboBox, ComboBoxItem } from "./ComboBox";

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

const renderComboBox = (props = {}) =>
  render(
    <ComboBox label="Ice cream flavor" {...props}>
      <ComboBoxItem id="chocolate">Chocolate</ComboBoxItem>
      <ComboBoxItem id="mint">Mint</ComboBoxItem>
      <ComboBoxItem id="strawberry">Strawberry</ComboBoxItem>
      <ComboBoxItem id="vanilla">Vanilla</ComboBoxItem>
    </ComboBox>
  );

describe("ComboBox", () => {
  it("renders a labeled combobox input", () => {
    renderComboBox();

    expect(
      screen.getByRole("combobox", { name: "Ice cream flavor" })
    ).toBeInTheDocument();
  });

  it("renders the placeholder on the input", () => {
    renderComboBox({ placeholder: "Choose a flavor" });

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "placeholder",
      "Choose a flavor"
    );
  });

  it("opens the listbox with all options when the trigger button is clicked", async () => {
    const user = userEvent.setup();
    renderComboBox();

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("filters options as the user types", async () => {
    const user = userEvent.setup();
    renderComboBox();

    await user.type(screen.getByRole("combobox"), "str");

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Strawberry");
  });

  it("selects an option, fills the input and calls onSelectionChange", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderComboBox({ onSelectionChange });

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("option", { name: "Mint" }));

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith("mint");
    expect(screen.getByRole("combobox")).toHaveValue("Mint");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("marks disabled options and prevents selecting them", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderComboBox({ disabledKeys: ["vanilla"], onSelectionChange });

    await user.click(screen.getByRole("button"));

    const vanilla = screen.getByRole("option", { name: "Vanilla" });
    expect(vanilla).toHaveAttribute("aria-disabled", "true");

    await user.click(vanilla);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("supports keyboard selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderComboBox({ onSelectionChange });

    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Enter}");

    expect(onSelectionChange).toHaveBeenCalledWith("chocolate");
    expect(input).toHaveValue("Chocolate");
  });

  it("renders a description when provided", () => {
    renderComboBox({ description: "Start typing to filter" });

    expect(screen.getByText("Start typing to filter")).toBeInTheDocument();
  });
});
