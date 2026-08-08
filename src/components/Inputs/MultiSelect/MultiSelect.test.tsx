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

  describe("size", () => {
    it('renders data-field-size="md" by default', () => {
      const { container } = renderMultiSelect();

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "md"
      );
    });

    it('renders data-field-size="sm" when specified', () => {
      const { container } = renderMultiSelect({ size: "sm" });

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "sm"
      );
    });

    it('renders data-field-size="lg" when specified', () => {
      const { container } = renderMultiSelect({ size: "lg" });

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "lg"
      );
    });

    it("does not forward size to the DOM input", () => {
      renderMultiSelect({ size: "sm" });

      expect(screen.getByRole("combobox")).not.toHaveAttribute("size");
    });

    it.each(["sm", "lg"] as const)(
      "forwards size %s to the portaled popover",
      async (size) => {
        const user = userEvent.setup();
        renderMultiSelect({ size });

        await user.click(screen.getByRole("combobox"));

        const listbox = await screen.findByRole("listbox");
        expect(listbox.closest("[data-field-size]")).toHaveAttribute(
          "data-field-size",
          size
        );
      }
    );
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

    it("clears a filter that matches a selection control when allowsSelectAll uses defaultItems", async () => {
      // "a" matches "Select all". That used to freeze the input on Backspace when
      // the controls lived in a ListBoxSection (react-stately section filtering
      // threw under React 19 and aborted the controlled value update).
      const user = userEvent.setup();
      const fruits = [
        { id: "apple", name: "Apple" },
        { id: "banana", name: "Banana" },
        { id: "carrot", name: "Carrot" },
      ];
      const { container } = render(
        <MultiSelect
          label="Fruits"
          allowsSelectAll
          defaultItems={fruits}
          defaultValue={["apple"]}
        >
          {(item) => (
            <MultiSelectItem id={item.id}>{item.name}</MultiSelectItem>
          )}
        </MultiSelect>
      );
      const input = screen.getByRole("combobox");

      await user.type(input, "a");
      expect(input).toHaveValue("a");
      expect(
        (await screen.findAllByRole("option")).map((option) => option.textContent)
      ).toContain("Select all");

      await user.keyboard("{Backspace}");

      expect(input).toHaveValue("");
      await user.keyboard("b");
      expect(input).toHaveValue("b");
      expect(getTagLabels(container)).toEqual(["Apple"]);
    });
  });

  describe("selection controls", () => {
    const getOptionNames = () =>
      screen.getAllByRole("option").map((option) => option.textContent);

    it("does not render the controls by default", async () => {
      const user = userEvent.setup();
      renderMultiSelect();

      await user.click(screen.getByRole("combobox"));

      expect(await screen.findByRole("listbox")).toBeInTheDocument();
      expect(
        screen.queryByRole("option", { name: "Select all" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("option", { name: "Select none" })
      ).not.toBeInTheDocument();
    });

    it("renders both controls as options ahead of the checkboxes", async () => {
      const user = userEvent.setup();
      renderMultiSelect({ allowsSelectAll: true });

      await user.click(screen.getByRole("combobox"));

      expect(await screen.findByRole("listbox")).toBeInTheDocument();
      expect(getOptionNames()).toEqual([
        "Select all",
        "Select none",
        "Apple",
        "Banana",
        "Carrot",
      ]);
    });

    it("renders the controls with custom labels", async () => {
      const user = userEvent.setup();
      renderMultiSelect({
        allowsSelectAll: true,
        selectAllLabel: "All",
        selectNoneLabel: "None",
      });

      await user.click(screen.getByRole("combobox"));

      expect(await screen.findByRole("option", { name: "All" })).toBeVisible();
      expect(screen.getByRole("option", { name: "None" })).toBeVisible();
    });

    it("renders the controls as a sticky toolbar above the options", async () => {
      const user = userEvent.setup();
      const { container } = renderMultiSelect({ allowsSelectAll: true });

      await user.click(screen.getByRole("combobox"));
      await screen.findByRole("listbox");

      const controls = document.querySelectorAll(".multi-select-control");
      expect(controls).toHaveLength(2);
      // Portaled into the popover, not into the field's own container.
      expect(container.querySelector(".multi-select-control")).toBeNull();
    });

    it("selects every option when select all is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderMultiSelect({
        allowsSelectAll: true,
        onChange,
      });

      await user.click(screen.getByRole("combobox"));
      await user.click(
        await screen.findByRole("option", { name: "Select all" })
      );

      expect(onChange).toHaveBeenLastCalledWith(["apple", "banana", "carrot"]);
      expect(getTagLabels(container)).toEqual(["Apple", "Banana", "Carrot"]);
      for (const name of ["Apple", "Banana", "Carrot"]) {
        expect(screen.getByRole("option", { name })).toHaveAttribute(
          "aria-selected",
          "true"
        );
      }
    });

    it("clears the selection when select none is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderMultiSelect({
        allowsSelectAll: true,
        defaultValue: ["apple", "carrot"],
        onChange,
      });

      await user.click(screen.getByRole("combobox"));
      await user.click(
        await screen.findByRole("option", { name: "Select none" })
      );

      expect(onChange).toHaveBeenLastCalledWith([]);
      await waitFor(() => {
        expect(getTagLabels(container)).toEqual([]);
      });
    });

    it("keeps the menu open after a control is used", async () => {
      const user = userEvent.setup();
      renderMultiSelect({ allowsSelectAll: true });

      await user.click(screen.getByRole("combobox"));
      await user.click(
        await screen.findByRole("option", { name: "Select all" })
      );

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(getOptionNames()).toHaveLength(5);
    });

    it("never selects the controls themselves", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderMultiSelect({
        allowsSelectAll: true,
        onChange,
      });

      await user.click(screen.getByRole("combobox"));
      const selectAll = await screen.findByRole("option", {
        name: "Select all",
      });
      await user.click(selectAll);

      expect(selectAll).toHaveAttribute("aria-selected", "false");
      expect(getTagLabels(container)).toEqual(["Apple", "Banana", "Carrot"]);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("does not notify onChange when a control changes nothing", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderMultiSelect({
        allowsSelectAll: true,
        defaultValue: ["apple", "banana", "carrot"],
        onChange,
      });

      await user.click(screen.getByRole("combobox"));
      await user.click(
        await screen.findByRole("option", { name: "Select all" })
      );

      expect(onChange).not.toHaveBeenCalled();
    });

    it("leaves disabled options unselected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderMultiSelect({
        allowsSelectAll: true,
        disabledKeys: ["banana"],
        onChange,
      });

      await user.click(screen.getByRole("combobox"));
      await user.click(
        await screen.findByRole("option", { name: "Select all" })
      );

      expect(onChange).toHaveBeenLastCalledWith(["apple", "carrot"]);
    });

    it("moves to the controls first with the arrow keys", async () => {
      const user = userEvent.setup();
      renderMultiSelect({ allowsSelectAll: true });
      const input = screen.getByRole("combobox");

      await user.click(input);
      await screen.findByRole("listbox");
      await user.keyboard("{ArrowDown}");

      expect(
        screen.getByRole("option", { name: "Select all" })
      ).toHaveAttribute("data-focused", "true");

      await user.keyboard("{ArrowDown}");
      expect(
        screen.getByRole("option", { name: "Select none" })
      ).toHaveAttribute("data-focused", "true");
    });

    it("runs the focused control on Enter and keeps the menu open", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderMultiSelect({
        allowsSelectAll: true,
        onChange,
      });

      await user.click(screen.getByRole("combobox"));
      await screen.findByRole("listbox");
      await user.keyboard("{ArrowDown}{Enter}");

      expect(onChange).toHaveBeenLastCalledWith(["apple", "banana", "carrot"]);
      expect(getTagLabels(container)).toEqual(["Apple", "Banana", "Carrot"]);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("keeps the control focused after Enter, so the next one is a key away", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderMultiSelect({
        allowsSelectAll: true,
        onChange,
      });

      await user.click(screen.getByRole("combobox"));
      await screen.findByRole("listbox");
      // Select all, then move on to the control beside it and clear again.
      await user.keyboard("{ArrowDown}{Enter}");
      expect(
        screen.getByRole("option", { name: "Select all" })
      ).toHaveAttribute("data-focused", "true");

      await user.keyboard("{ArrowDown}{Enter}");

      expect(onChange).toHaveBeenLastCalledWith([]);
      expect(getTagLabels(container)).toEqual([]);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("filters the controls out along with the options", async () => {
      const user = userEvent.setup();
      renderMultiSelect({ allowsSelectAll: true });

      await user.type(screen.getByRole("combobox"), "ban");

      expect(await screen.findByRole("listbox")).toBeInTheDocument();
      expect(getOptionNames()).toEqual(["Banana"]);
    });

    it("only selects the matching options while a filter is typed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderMultiSelect({
        allowsSelectAll: true,
        defaultValue: ["apple"],
        onChange,
      });

      // "c" matches "Select all" and "Select none" as well as "Carrot".
      await user.type(screen.getByRole("combobox"), "c");
      expect(await screen.findByRole("listbox")).toBeInTheDocument();
      expect(getOptionNames()).toEqual(["Select all", "Select none", "Carrot"]);

      await user.click(screen.getByRole("option", { name: "Select all" }));

      expect(onChange).toHaveBeenLastCalledWith(["carrot", "apple"]);
    });

    it("only clears the matching options while a filter is typed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderMultiSelect({
        allowsSelectAll: true,
        defaultValue: ["apple", "carrot"],
        onChange,
      });

      await user.type(screen.getByRole("combobox"), "c");
      await user.click(
        await screen.findByRole("option", { name: "Select none" })
      );

      expect(onChange).toHaveBeenLastCalledWith(["apple"]);
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
