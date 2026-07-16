import { render, screen, waitFor } from "@testing-library/react";
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
  it("renders a labeled combobox input", () => {
    renderSelect();

    expect(
      screen.getByRole("combobox", { name: "Ice cream flavor" })
    ).toBeInTheDocument();
  });

  it("renders the default placeholder on the input", () => {
    renderSelect();

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "placeholder",
      "Select an item"
    );
  });

  it("renders a custom placeholder", () => {
    renderSelect({ placeholder: "Choose a flavor" });

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "placeholder",
      "Choose a flavor"
    );
  });

  it("opens the listbox with all options when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderSelect();

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.click(screen.getByRole("combobox"));

    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(4);
    expect(options.map((o) => o.textContent)).toEqual([
      "Chocolate",
      "Mint",
      "Strawberry",
      "Vanilla",
    ]);
  });

  it("filters options as the user types", async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.type(screen.getByRole("combobox"), "str");

    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("Strawberry");
    });
  });

  it("shows an empty state when no options match", async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.type(screen.getByRole("combobox"), "zzz");

    expect(await screen.findByText("No results found.")).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Chocolate" })
    ).not.toBeInTheDocument();
  });

  it("selects an option, fills the input, closes and calls onSelectionChange", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderSelect({ onSelectionChange });

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Mint" }));

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledWith("mint");
    expect(screen.getByRole("combobox")).toHaveValue("Mint");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("renders the selected value for defaultSelectedKey", () => {
    renderSelect({ defaultSelectedKey: "strawberry" });

    expect(screen.getByRole("combobox")).toHaveValue("Strawberry");
  });

  it("marks the selected option with a check", async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Mint" }));

    // Reopen via the chevron toggle so all options show.
    await user.click(screen.getByRole("button"));
    const mint = await screen.findByRole("option", { name: "Mint" });
    expect(mint).toHaveAttribute("aria-selected", "true");
    // The dropdown renders in a portal, so query the option element directly.
    expect(mint.querySelector(".lucide-check")).toBeInTheDocument();
    expect(
      screen
        .getByRole("option", { name: "Chocolate" })
        .querySelector(".lucide-check")
    ).not.toBeInTheDocument();
  });

  it("marks disabled options and prevents selecting them", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderSelect({ disabledKeys: ["mint"], onSelectionChange });

    await user.click(screen.getByRole("combobox"));

    const mint = await screen.findByRole("option", { name: "Mint" });
    expect(mint).toHaveAttribute("aria-disabled", "true");

    await user.click(mint);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("supports keyboard selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderSelect({ onSelectionChange });

    await user.tab();
    expect(await screen.findByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSelectionChange).toHaveBeenCalledWith("chocolate");
    expect(screen.getByRole("combobox")).toHaveValue("Chocolate");
  });

  it("supports a disabled state", () => {
    renderSelect({ isDisabled: true });

    expect(screen.getByRole("combobox")).toBeDisabled();
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
