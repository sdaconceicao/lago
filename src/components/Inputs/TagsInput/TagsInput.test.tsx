import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagsInput } from "./TagsInput";
import type { TagsInputItem } from "./TagsInput.utils";

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

const SKILLS: TagsInputItem[] = [
  { id: "react", label: "React" },
  { id: "css", label: "CSS" },
  { id: "graphql", label: "GraphQL" },
];

const renderTagsInput = (props = {}) =>
  render(<TagsInput label="Skills" items={SKILLS} {...props} />);

const getToggleButton = () =>
  screen
    .getAllByRole("button")
    .find((button) => button.hasAttribute("aria-haspopup")) as HTMLElement;

// Tags are queried by class rather than role because React Aria hides content
// outside the popover from the accessibility tree while it is open.
const getTagLabels = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".react-aria-Tag")).map(
    (tag) => tag.textContent
  );

describe("TagsInput", () => {
  describe("rendering", () => {
    it("renders a labeled combobox input", () => {
      renderTagsInput();

      expect(
        screen.getByRole("combobox", { name: "Skills" })
      ).toBeInTheDocument();
    });

    it("renders the placeholder", () => {
      renderTagsInput({ placeholder: "Search skills..." });

      expect(screen.getByRole("combobox")).toHaveAttribute(
        "placeholder",
        "Search skills..."
      );
    });

    it("keeps the placeholder while tags are selected, since the tags sit below the field", () => {
      renderTagsInput({
        placeholder: "Search skills...",
        defaultValue: ["react"],
      });

      expect(screen.getByRole("combobox")).toHaveAttribute(
        "placeholder",
        "Search skills..."
      );
    });

    it("renders a description when provided", () => {
      renderTagsInput({ description: "Add up to ten skills" });

      expect(screen.getByText("Add up to ten skills")).toBeInTheDocument();
    });

    it("renders the error message when invalid", () => {
      renderTagsInput({
        isInvalid: true,
        errorMessage: "Add at least one skill",
      });

      expect(screen.getByText("Add at least one skill")).toBeInTheDocument();
    });

    it("disables the input when isDisabled is set", () => {
      renderTagsInput({ isDisabled: true });

      expect(screen.getByRole("combobox")).toBeDisabled();
    });

    it("renders the preselected tags below the field", () => {
      const { container } = renderTagsInput({
        defaultValue: ["react", "graphql"],
      });

      expect(getTagLabels(container)).toEqual(["React", "GraphQL"]);
    });

    it("renders no tag group while nothing is selected", () => {
      const { container } = renderTagsInput();

      expect(container.querySelector(".react-aria-TagGroup")).toBeNull();
    });

    it("renders the tags after the field, not inside it", () => {
      const { container } = renderTagsInput({ defaultValue: ["react"] });

      const field = container.querySelector(".react-aria-Group") as HTMLElement;
      const tagGroup = container.querySelector(
        ".react-aria-TagGroup"
      ) as HTMLElement;
      expect(field.contains(tagGroup)).toBe(false);
      expect(
        field.compareDocumentPosition(tagGroup) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });
  });

  describe("size", () => {
    it('renders data-field-size="md" by default', () => {
      const { container } = renderTagsInput();

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "md"
      );
    });

    it.each(["sm", "md", "lg"] as const)(
      'renders data-field-size="%s" when specified',
      (size) => {
        const { container } = renderTagsInput({ size });

        expect(container.querySelector("[data-field-size]")).toHaveAttribute(
          "data-field-size",
          size
        );
      }
    );

    it("does not forward size to the DOM input", () => {
      renderTagsInput({ size: "sm" });

      expect(screen.getByRole("combobox")).not.toHaveAttribute("size");
    });

    it.each(["sm", "lg"] as const)(
      "forwards size %s to the portaled popover",
      async (size) => {
        const user = userEvent.setup();
        renderTagsInput({ size });

        await user.click(screen.getByRole("combobox"));

        const listbox = await screen.findByRole("listbox");
        expect(listbox.closest("[data-field-size]")).toHaveAttribute(
          "data-field-size",
          size
        );
      }
    );

    it('sizes the tag group "md" so the chips scale from the field scope', () => {
      const { container } = renderTagsInput({
        size: "lg",
        defaultValue: ["react"],
      });

      expect(container.querySelector(".react-aria-TagGroup")).toHaveAttribute(
        "data-size",
        "md"
      );
    });
  });

  describe("autocomplete", () => {
    it("opens a multi-selectable listbox with all options on focus", async () => {
      const user = userEvent.setup();
      renderTagsInput();

      await user.click(screen.getByRole("combobox"));

      const listbox = await screen.findByRole("listbox");
      expect(listbox).toHaveAttribute("aria-multiselectable", "true");
      expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("opens and closes via the toggle button", async () => {
      const user = userEvent.setup();
      renderTagsInput();
      const toggle = getToggleButton();

      expect(toggle).toHaveAttribute("aria-expanded", "false");

      await user.click(toggle);
      expect(await screen.findByRole("listbox")).toBeInTheDocument();

      await user.click(toggle);
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("filters options as the user types", async () => {
      const user = userEvent.setup();
      renderTagsInput();

      await user.type(screen.getByRole("combobox"), "gra");

      const options = await screen.findAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent("GraphQL");
    });

    it("shows an empty state when no options match", async () => {
      const user = userEvent.setup();
      renderTagsInput();

      await user.type(screen.getByRole("combobox"), "zzz");

      expect(await screen.findByText("No results found.")).toBeInTheDocument();
    });

    it("uses a custom empty state when provided", async () => {
      const user = userEvent.setup();
      renderTagsInput({ emptyState: "Nothing like that here." });

      await user.type(screen.getByRole("combobox"), "zzz");

      expect(
        await screen.findByText("Nothing like that here.")
      ).toBeInTheDocument();
    });

    it("marks options whose tag is already added as selected", async () => {
      const user = userEvent.setup();
      renderTagsInput({ defaultValue: ["css"] });

      await user.click(screen.getByRole("combobox"));

      expect(
        await screen.findByRole("option", { name: "CSS" })
      ).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("option", { name: "React" })).toHaveAttribute(
        "aria-selected",
        "false"
      );
    });

    it("keeps the menu open and the options visible after adding a tag", async () => {
      const user = userEvent.setup();
      renderTagsInput();

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: "React" }));

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("clears the typed filter after adding a tag", async () => {
      const user = userEvent.setup();
      renderTagsInput();
      const input = screen.getByRole("combobox");

      await user.type(input, "gra");
      await user.click(await screen.findByRole("option", { name: "GraphQL" }));

      expect(input).toHaveValue("");
    });
  });

  describe("selecting from the list", () => {
    it("adds a tag below the field when an option is picked", async () => {
      const user = userEvent.setup();
      const { container } = renderTagsInput();

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: "React" }));

      expect(getTagLabels(container)).toEqual(["React"]);
    });

    it("removes the tag when the same option is toggled off", async () => {
      const user = userEvent.setup();
      const { container } = renderTagsInput({ defaultValue: ["react"] });

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: "React" }));

      await waitFor(() => {
        expect(getTagLabels(container)).toEqual([]);
      });
    });

    it("calls onChange with every selected key", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderTagsInput({ onChange });

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: "React" }));
      expect(onChange).toHaveBeenLastCalledWith(["react"]);

      await user.click(screen.getByRole("option", { name: "CSS" }));
      expect(onChange).toHaveBeenLastCalledWith(["react", "css"]);
    });
  });

  describe("removing tags", () => {
    it("removes a tag via its remove button", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderTagsInput({ defaultValue: ["react", "css"], onChange });

      const reactTag = screen.getByRole("row", { name: "React" });
      await user.click(within(reactTag).getByRole("button"));

      expect(
        screen.queryByRole("row", { name: "React" })
      ).not.toBeInTheDocument();
      expect(screen.getByRole("row", { name: "CSS" })).toBeInTheDocument();
      expect(onChange).toHaveBeenCalledWith(["css"]);
    });

    it("removes the last tag on backspace when the input is empty", async () => {
      const user = userEvent.setup();
      const { container } = renderTagsInput({ defaultValue: ["react", "css"] });

      await user.click(screen.getByRole("combobox"));
      await user.keyboard("{Backspace}");

      expect(getTagLabels(container)).toEqual(["React"]);
    });

    it("removes every tag with repeated backspace", async () => {
      const user = userEvent.setup();
      const { container } = renderTagsInput({ defaultValue: ["react", "css"] });

      await user.click(screen.getByRole("combobox"));
      await user.keyboard("{Backspace}{Backspace}");

      expect(getTagLabels(container)).toEqual([]);
    });

    it("does not remove tags while the input has text", async () => {
      const user = userEvent.setup();
      const { container } = renderTagsInput({ defaultValue: ["react"] });
      const input = screen.getByRole("combobox");

      await user.type(input, "c");
      await user.keyboard("{Backspace}");

      expect(input).toHaveValue("");
      expect(getTagLabels(container)).toEqual(["React"]);
    });

    it("withholds the remove buttons when the field is disabled", () => {
      renderTagsInput({ isDisabled: true, defaultValue: ["react"] });

      expect(screen.queryByRole("button", { name: /Remove/ })).toBeNull();
    });

    it("withholds the remove buttons when the field is read only", () => {
      renderTagsInput({ isReadOnly: true, defaultValue: ["react"] });

      expect(screen.queryByRole("button", { name: /Remove/ })).toBeNull();
    });
  });

  describe("adding new items", () => {
    it("offers no create row without allowsCreate", async () => {
      const user = userEvent.setup();
      renderTagsInput();

      await user.type(screen.getByRole("combobox"), "Rust");

      expect(await screen.findByText("No results found.")).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: /^Add/ })).toBeNull();
    });

    it("offers a create row for an unmatched query", async () => {
      const user = userEvent.setup();
      renderTagsInput({ allowsCreate: true });

      await user.type(screen.getByRole("combobox"), "Rust");

      expect(
        await screen.findByRole("option", { name: "Add “Rust”" })
      ).toBeInTheDocument();
    });

    it("keeps the create row alongside partial matches", async () => {
      const user = userEvent.setup();
      renderTagsInput({ allowsCreate: true });

      await user.type(screen.getByRole("combobox"), "gra");

      const options = await screen.findAllByRole("option");
      expect(options.map((option) => option.textContent)).toEqual([
        "GraphQL",
        "Add “gra”",
      ]);
    });

    it("keeps the create row when the query has trailing whitespace", async () => {
      const user = userEvent.setup();
      renderTagsInput({ allowsCreate: true });

      await user.type(screen.getByRole("combobox"), "Rust ");

      expect(
        await screen.findByRole("option", { name: "Add “Rust ”" })
      ).toBeInTheDocument();
    });

    it("offers no create row when the query already names an option", async () => {
      const user = userEvent.setup();
      renderTagsInput({ allowsCreate: true });

      await user.type(screen.getByRole("combobox"), "react");

      const options = await screen.findAllByRole("option");
      expect(options.map((option) => option.textContent)).toEqual(["React"]);
    });

    it("adds a tag when the create row is picked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderTagsInput({ allowsCreate: true, onChange });

      await user.type(screen.getByRole("combobox"), "Rust");
      await user.click(
        await screen.findByRole("option", { name: "Add “Rust”" })
      );

      expect(getTagLabels(container)).toEqual(["Rust"]);
      // The synthetic create key must never escape to the caller.
      expect(onChange).toHaveBeenLastCalledWith(["Rust"]);
    });

    it("adds a tag when enter is pressed on an unmatched query", async () => {
      const user = userEvent.setup();
      const { container } = renderTagsInput({ allowsCreate: true });

      await user.type(screen.getByRole("combobox"), "Rust{Enter}");

      expect(getTagLabels(container)).toEqual(["Rust"]);
    });

    it("trims the created tag's label", async () => {
      const user = userEvent.setup();
      const { container } = renderTagsInput({ allowsCreate: true });

      await user.type(screen.getByRole("combobox"), "  Rust  {Enter}");

      expect(getTagLabels(container)).toEqual(["Rust"]);
    });

    it("clears the input after creating a tag", async () => {
      const user = userEvent.setup();
      renderTagsInput({ allowsCreate: true });
      const input = screen.getByRole("combobox");

      await user.type(input, "Rust{Enter}");

      expect(input).toHaveValue("");
    });

    it("reports each created item through onCreate", async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      renderTagsInput({ allowsCreate: true, onCreate });

      await user.type(screen.getByRole("combobox"), "Rust{Enter}");

      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onCreate).toHaveBeenCalledWith({ id: "Rust", label: "Rust" });
    });

    it("does not create a second tag for the same text", async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      const { container } = renderTagsInput({ allowsCreate: true, onCreate });
      const input = screen.getByRole("combobox");

      await user.type(input, "Rust{Enter}");
      await user.type(input, "rust{Enter}");

      expect(getTagLabels(container)).toEqual(["Rust"]);
      expect(onCreate).toHaveBeenCalledTimes(1);
    });

    it("keeps a created option in the list so it can be added again", async () => {
      const user = userEvent.setup();
      const { container } = renderTagsInput({ allowsCreate: true });
      const input = screen.getByRole("combobox");

      await user.type(input, "Rust{Enter}");
      // The dropdown stays open after adding, and React Aria hides everything
      // outside the popover from the accessibility tree while it is — so close
      // it before reaching for the chip by role.
      await user.keyboard("{Escape}");
      await user.click(
        within(screen.getByRole("row", { name: "Rust" })).getByRole("button")
      );
      expect(getTagLabels(container)).toEqual([]);

      await user.click(input);

      expect(
        await screen.findByRole("option", { name: "Rust" })
      ).toBeInTheDocument();
    });

    it("adds an existing option when enter is pressed on its exact name", async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      const { container } = renderTagsInput({ allowsCreate: true, onCreate });

      await user.type(screen.getByRole("combobox"), "css{Enter}");

      expect(getTagLabels(container)).toEqual(["CSS"]);
      expect(onCreate).not.toHaveBeenCalled();
    });

    it("does nothing on enter for an unmatched query without allowsCreate", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderTagsInput({ onChange });

      await user.type(screen.getByRole("combobox"), "Rust{Enter}");

      expect(getTagLabels(container)).toEqual([]);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("commits the highlighted option rather than the raw text on enter", async () => {
      const user = userEvent.setup();
      const { container } = renderTagsInput({ allowsCreate: true });

      await user.type(screen.getByRole("combobox"), "gra");
      await screen.findByRole("option", { name: "GraphQL" });
      await user.keyboard("{ArrowDown}{Enter}");

      expect(getTagLabels(container)).toEqual(["GraphQL"]);
    });
  });

  describe("controlled value", () => {
    it("renders the tags given by value", () => {
      const { container } = renderTagsInput({ value: ["react", "css"] });

      expect(getTagLabels(container)).toEqual(["React", "CSS"]);
    });

    it("does not change the selection on its own", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = renderTagsInput({ value: ["react"], onChange });

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: "CSS" }));

      expect(onChange).toHaveBeenLastCalledWith(["react", "css"]);
      expect(getTagLabels(container)).toEqual(["React"]);
    });

    it("survives a caller passing a fresh array on every render", async () => {
      const user = userEvent.setup();
      // React Aria resets the input value whenever the controlled value's
      // identity changes, so a new array literal per render used to wipe the
      // query on every keystroke.
      const Wrapper = () => (
        <TagsInput label="Skills" items={SKILLS} value={["react"]} />
      );
      const { rerender } = render(<Wrapper />);
      const input = screen.getByRole("combobox");

      await user.type(input, "gra");
      rerender(<Wrapper />);

      expect(input).toHaveValue("gra");
    });
  });

  describe("onInputChange", () => {
    it("reports the query as it is typed", async () => {
      const user = userEvent.setup();
      const onInputChange = vi.fn();
      renderTagsInput({ onInputChange });

      await user.type(screen.getByRole("combobox"), "gr");

      expect(onInputChange).toHaveBeenNthCalledWith(1, "g");
      expect(onInputChange).toHaveBeenNthCalledWith(2, "gr");
    });
  });
});
