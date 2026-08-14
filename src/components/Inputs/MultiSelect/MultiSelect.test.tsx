import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import listBoxStyles from "@/components/Collections/ListBox/ListBox.module.css";
import tagStyles from "./BaseComponents/MultiSelectTags/MultiSelectTags.module.css";
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

    // An option is not a ListBoxItem variant: it lays itself out as a row,
    // where that component's `justify-content: center` would centre it
    // horizontally, and the two tie on specificity inside one cascade layer.
    // See BaseListBoxItem.
    it("does not inherit ListBoxItem's styling", async () => {
      const user = userEvent.setup();
      renderMultiSelect();

      await user.click(screen.getByRole("combobox"));

      expect(
        await screen.findByRole("option", { name: "Apple" })
      ).not.toHaveClass(listBoxStyles.listBoxItem);
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

  describe("tag overflow", () => {
    // jsdom reports every box as 0x0, which the component reads as "not
    // measured yet" and answers by showing everything — the same path SSR
    // takes. These tests stub the three reads it actually makes so the fitting
    // logic can be exercised here; the real browser measurements are asserted
    // by the Overflow story's play(), which runs in Chromium.
    const TOGGLE_WIDTH = 24;
    const TAG_WIDTH = 100;
    const COUNTER_WIDTH = 32;

    let fieldWidth = 0;

    /** Captures its callbacks so a resize can be delivered on demand. */
    class ControllableResizeObserver {
      static instances: ControllableResizeObserver[] = [];

      constructor(private readonly callback: ResizeObserverCallback) {
        ControllableResizeObserver.instances.push(this);
      }

      observe() {}
      unobserve() {}
      disconnect() {}

      static resizeTo(inlineSize: number) {
        fieldWidth = inlineSize;
        for (const observer of ControllableResizeObserver.instances) {
          observer.callback(
            [
              {
                contentBoxSize: [{ inlineSize, blockSize: 36 }],
              } as unknown as ResizeObserverEntry,
            ],
            observer as unknown as ResizeObserver
          );
        }
      }
    }

    const widthDescriptors = {
      offsetWidth: {
        configurable: true,
        get(this: HTMLElement) {
          if (this.className.includes("counterProbe")) return COUNTER_WIDTH;
          if (this.classList.contains("react-aria-Tag")) return TAG_WIDTH;
          if (this.classList.contains("field-Button")) return TOGGLE_WIDTH;
          return 0;
        },
      },
      clientWidth: {
        configurable: true,
        get(this: HTMLElement) {
          return this.classList.contains("react-aria-Group") ? fieldWidth : 0;
        },
      },
    };

    const originalDescriptors = {
      offsetWidth: Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        "offsetWidth"
      ),
      clientWidth: Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        "clientWidth"
      ),
    };

    beforeAll(() => {
      Object.defineProperties(HTMLElement.prototype, widthDescriptors);
    });

    afterAll(() => {
      for (const [name, descriptor] of Object.entries(originalDescriptors)) {
        if (descriptor) {
          Object.defineProperty(HTMLElement.prototype, name, descriptor);
        } else {
          delete (HTMLElement.prototype as unknown as Record<string, unknown>)[
            name
          ];
        }
      }
    });

    beforeEach(() => {
      ControllableResizeObserver.instances = [];
      vi.stubGlobal("ResizeObserver", ControllableResizeObserver);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    // The offscreen measuring probe is a counter too, so the visible one has
    // to be picked out by class rather than by its "+N" text.
    const getCounter = (container: HTMLElement) =>
      container.querySelector(
        `.${tagStyles.counter}:not(.${tagStyles.counterProbe})`
      );

    const COUNTIES = ["Adams", "Berks", "Bucks", "Erie", "Pike"];

    const renderCounties = (props = {}) => {
      const result = render(
        <MultiSelect
          aria-label="Counties"
          defaultValue={COUNTIES.map((county) => county.toLowerCase())}
          {...props}
        >
          {COUNTIES.map((county) => (
            <MultiSelectItem key={county} id={county.toLowerCase()}>
              {`${county} County`}
            </MultiSelectItem>
          ))}
        </MultiSelect>
      );
      return result;
    };

    it("shows every tag when the whole selection fits", () => {
      // 1000 - 24 toggle leaves 976 for 5 x 100 of tags.
      fieldWidth = 1000;
      const { container } = renderCounties();

      expect(getTagLabels(container)).toHaveLength(5);
      expect(screen.queryByText(/more selected/)).not.toBeInTheDocument();
    });

    it("collapses the tags that do not fit into a counter", () => {
      // 300 - 24 toggle = 276, less 32 for the counter leaves 244: two tags.
      fieldWidth = 300;
      const { container } = renderCounties();

      expect(getTagLabels(container)).toEqual(["Adams County", "Berks County"]);
      expect(getCounter(container)).toHaveTextContent("+3");
    });

    it("names the hidden count for assistive technology", () => {
      fieldWidth = 300;
      renderCounties();

      expect(screen.getByText("3 more selected")).toBeInTheDocument();
    });

    it("renders every tag at full width rather than shrinking them", () => {
      fieldWidth = 300;
      const { container } = renderCounties();

      for (const tag of container.querySelectorAll<HTMLElement>(
        ".react-aria-Tag"
      )) {
        expect(tag.offsetWidth).toBe(TAG_WIDTH);
      }
    });

    it("shows more tags as the field grows", () => {
      fieldWidth = 300;
      const { container } = renderCounties();

      expect(getTagLabels(container)).toHaveLength(2);

      act(() => {
        ControllableResizeObserver.resizeTo(1000);
      });

      expect(getTagLabels(container)).toHaveLength(5);
      expect(screen.queryByText(/more selected/)).not.toBeInTheDocument();
    });

    it("collapses again as the field shrinks", () => {
      fieldWidth = 1000;
      const { container } = renderCounties();

      expect(getTagLabels(container)).toHaveLength(5);

      act(() => {
        ControllableResizeObserver.resizeTo(300);
      });

      expect(getTagLabels(container)).toHaveLength(2);
      expect(getCounter(container)).toHaveTextContent("+3");
    });

    it("recounts when a visible tag is removed", async () => {
      const user = userEvent.setup();
      fieldWidth = 300;
      const { container } = renderCounties();

      const adams = screen.getByRole("row", { name: "Adams County" });
      await user.click(within(adams).getByRole("button"));

      expect(getTagLabels(container)).toEqual(["Berks County", "Bucks County"]);
      expect(getCounter(container)).toHaveTextContent("+2");
    });

    it("drops the counter once the rest of the selection fits", async () => {
      const user = userEvent.setup();
      // 276 of room, so three 100px tags never fit alongside the counter.
      fieldWidth = 300;
      const { container } = renderCounties({
        defaultValue: ["adams", "berks", "bucks"],
      });

      expect(getCounter(container)).toHaveTextContent("+1");

      await user.click(
        within(screen.getByRole("row", { name: "Adams County" })).getByRole(
          "button"
        )
      );

      expect(getTagLabels(container)).toEqual(["Berks County", "Bucks County"]);
      expect(screen.queryByText(/more selected/)).not.toBeInTheDocument();
    });

    it("shows one ellipsised tag when not even the first one fits", () => {
      // 90 - 24 toggle = 66, well under a single 100px tag.
      fieldWidth = 90;
      const { container } = renderCounties();

      expect(getTagLabels(container)).toEqual(["Adams County"]);
      expect(getCounter(container)).toHaveTextContent("+4");
    });

    it("keeps every tag at lg, where the field wraps and grows", () => {
      fieldWidth = 300;
      const { container } = renderCounties({ size: "lg" });

      expect(getTagLabels(container)).toHaveLength(5);
      expect(screen.queryByText(/more selected/)).not.toBeInTheDocument();
    });

    it("re-measures when the size changes", () => {
      fieldWidth = 300;
      const { container, rerender } = renderCounties({ size: "lg" });

      expect(getTagLabels(container)).toHaveLength(5);

      rerender(
        <MultiSelect
          aria-label="Counties"
          size="md"
          defaultValue={COUNTIES.map((county) => county.toLowerCase())}
        >
          {COUNTIES.map((county) => (
            <MultiSelectItem key={county} id={county.toLowerCase()}>
              {`${county} County`}
            </MultiSelectItem>
          ))}
        </MultiSelect>
      );

      expect(getTagLabels(container)).toHaveLength(2);
      expect(getCounter(container)).toHaveTextContent("+3");
    });
  });
});
