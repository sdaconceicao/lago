import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiSelect, MultiSelectItem } from "./MultiSelect";

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

const renderMultiSelect = (props = {}) =>
  render(
    <MultiSelect label="Fruits" {...props}>
      <MultiSelectItem id="apple">Apple</MultiSelectItem>
      <MultiSelectItem id="banana">Banana</MultiSelectItem>
      <MultiSelectItem id="carrot">Carrot</MultiSelectItem>
    </MultiSelect>
  );

const getToggleButton = () =>
  screen
    .getAllByRole("button")
    .find((button) => button.hasAttribute("aria-haspopup")) as HTMLElement;

// Tags are queried by class rather than role because React Aria hides
// content outside the popover from the accessibility tree while it is open.
const getTagLabels = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".react-aria-Tag")).map(
    (tag) => tag.textContent
  );

describe("MultiSelect", () => {
  describe("rendering", () => {
    it("renders a labeled combobox input", () => {
      renderMultiSelect();

      expect(
        screen.getByRole("combobox", { name: "Fruits" })
      ).toBeInTheDocument();
    });

    it("renders the placeholder when nothing is selected", () => {
      renderMultiSelect({ placeholder: "Search fruits..." });

      expect(screen.getByRole("combobox")).toHaveAttribute(
        "placeholder",
        "Search fruits..."
      );
    });

    it("hides the placeholder when items are selected", () => {
      renderMultiSelect({
        placeholder: "Search fruits...",
        defaultValue: ["apple"],
      });

      expect(screen.getByRole("combobox")).not.toHaveAttribute("placeholder");
    });

    it("renders a description when provided", () => {
      renderMultiSelect({ description: "Pick one or more fruits" });

      expect(screen.getByText("Pick one or more fruits")).toBeInTheDocument();
    });

    it("renders the error message when invalid", () => {
      renderMultiSelect({
        isInvalid: true,
        errorMessage: "Please select a fruit",
      });

      expect(screen.getByText("Please select a fruit")).toBeInTheDocument();
    });

    it("disables the input when isDisabled is set", () => {
      renderMultiSelect({ isDisabled: true });

      expect(screen.getByRole("combobox")).toBeDisabled();
    });
  });

  describe("dropdown", () => {
    it("opens a multi-selectable listbox with all options on focus", async () => {
      const user = userEvent.setup();
      renderMultiSelect();

      await user.click(screen.getByRole("combobox"));

      const listbox = await screen.findByRole("listbox");
      expect(listbox).toHaveAttribute("aria-multiselectable", "true");
      expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("opens and closes via the toggle button", async () => {
      const user = userEvent.setup();
      renderMultiSelect();
      const toggle = getToggleButton();

      expect(toggle).toHaveAttribute("aria-expanded", "false");

      await user.click(toggle);
      expect(await screen.findByRole("listbox")).toBeInTheDocument();
      expect(toggle).toHaveAttribute("aria-expanded", "true");

      await user.click(toggle);
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("keeps the menu open and options visible after selecting", async () => {
      const user = userEvent.setup();
      renderMultiSelect();

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: "Apple" }));

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getAllByRole("option")).toHaveLength(3);
      expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    it("marks preselected options as selected", async () => {
      const user = userEvent.setup();
      renderMultiSelect({ defaultValue: ["banana"] });

      await user.click(screen.getByRole("combobox"));

      expect(
        await screen.findByRole("option", { name: "Banana" })
      ).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute(
        "aria-selected",
        "false"
      );
    });
  });

  describe("filtering", () => {
    it("filters options as the user types", async () => {
      const user = userEvent.setup();
      renderMultiSelect();

      await user.type(screen.getByRole("combobox"), "ban");

      const options = await screen.findAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("Banana");
    });

    it("clears the typed filter after selecting an option", async () => {
      const user = userEvent.setup();
      renderMultiSelect();
      const input = screen.getByRole("combobox");

      await user.type(input, "ban");
      await user.click(await screen.findByRole("option", { name: "Banana" }));

      expect(input).toHaveValue("");
      expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("shows an empty state when no options match", async () => {
      const user = userEvent.setup();
      renderMultiSelect();

      await user.type(screen.getByRole("combobox"), "zzz");

      expect(await screen.findByText("No results found.")).toBeInTheDocument();
      expect(
        screen.queryByRole("option", { name: "Apple" })
      ).not.toBeInTheDocument();
    });
  });

  describe("selection with tags", () => {
    it("adds a tag when an option is selected", async () => {
      const user = userEvent.setup();
      const { container } = renderMultiSelect();

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: "Apple" }));

      expect(getTagLabels(container)).toEqual(["Apple"]);
    });

    it("removes the tag when the same option is toggled off", async () => {
      const user = userEvent.setup();
      const { container } = renderMultiSelect({ defaultValue: ["apple"] });

      expect(getTagLabels(container)).toEqual(["Apple"]);

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: "Apple" }));

      await waitFor(() => {
        expect(getTagLabels(container)).toEqual([]);
      });
    });

    it("removes a tag via its remove button", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderMultiSelect({ defaultValue: ["apple", "banana"], onChange });

      const appleTag = screen.getByRole("row", { name: "Apple" });
      await user.click(within(appleTag).getByRole("button"));

      expect(
        screen.queryByRole("row", { name: "Apple" })
      ).not.toBeInTheDocument();
      expect(screen.getByRole("row", { name: "Banana" })).toBeInTheDocument();
      expect(onChange).toHaveBeenCalledWith(["banana"]);
    });

    it("calls onChange with the selected keys", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderMultiSelect({ onChange });

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: "Apple" }));
      expect(onChange).toHaveBeenLastCalledWith(["apple"]);

      await user.click(screen.getByRole("option", { name: "Carrot" }));
      expect(onChange).toHaveBeenLastCalledWith(["apple", "carrot"]);
    });

    it("calls onChange with an empty array when the last item is removed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderMultiSelect({ defaultValue: ["apple"], onChange });

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: "Apple" }));

      expect(onChange).toHaveBeenLastCalledWith([]);
    });
  });

  describe("backspace removal", () => {
    it("removes the last selected item on backspace when the input is empty", async () => {
      const user = userEvent.setup();
      const { container } = renderMultiSelect({
        defaultValue: ["apple", "banana"],
      });

      await user.click(screen.getByRole("combobox"));
      await user.keyboard("{Backspace}");

      expect(getTagLabels(container)).toEqual(["Apple"]);
    });

    it("removes all items with repeated backspace", async () => {
      const user = userEvent.setup();
      const { container } = renderMultiSelect({
        defaultValue: ["apple", "banana"],
      });

      await user.click(screen.getByRole("combobox"));
      await user.keyboard("{Backspace}{Backspace}");

      expect(getTagLabels(container)).toEqual([]);
    });

    it("does not remove items while the input has text", async () => {
      const user = userEvent.setup();
      const { container } = renderMultiSelect({ defaultValue: ["apple"] });
      const input = screen.getByRole("combobox");

      await user.type(input, "b");
      await user.keyboard("{Backspace}");

      expect(input).toHaveValue("");
      expect(getTagLabels(container)).toEqual(["Apple"]);
    });
  });

  describe('displayMode="text"', () => {
    const getTextValue = (container: HTMLElement) =>
      container.querySelector(".react-aria-ComboBoxValue");

    it("renders selected items as comma-separated text without tags", () => {
      const { container } = renderMultiSelect({
        displayMode: "text",
        defaultValue: ["apple", "banana"],
      });

      expect(getTextValue(container)).toHaveTextContent("Apple, Banana");
      expect(screen.queryAllByRole("row")).toHaveLength(0);
    });

    it("updates the text when selecting and deselecting options", async () => {
      const user = userEvent.setup();
      const { container } = renderMultiSelect({ displayMode: "text" });

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: "Apple" }));
      expect(getTextValue(container)).toHaveTextContent("Apple");

      await user.click(screen.getByRole("option", { name: "Apple" }));
      await waitFor(() => {
        expect(getTextValue(container)).not.toHaveTextContent("Apple");
      });
    });

    it("removes the last item on backspace when the input is empty", async () => {
      const user = userEvent.setup();
      const { container } = renderMultiSelect({
        displayMode: "text",
        defaultValue: ["apple", "banana"],
      });

      await user.click(screen.getByRole("combobox"));
      await user.keyboard("{Backspace}");

      expect(getTextValue(container)).toHaveTextContent("Apple");
      expect(getTextValue(container)).not.toHaveTextContent("Banana");
    });
  });
});
