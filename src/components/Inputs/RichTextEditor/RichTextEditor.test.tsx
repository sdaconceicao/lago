import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RichTextEditor } from "./RichTextEditor";
import type { RichTextEditorTool } from "./RichTextEditor.types";
import { TOOL_REGISTRY } from "./Toolbar/toolRegistry";

/**
 * ProseMirror measures the selection to scroll it into view after every
 * command, and jsdom implements neither `getClientRects` nor
 * `getBoundingClientRect` on `Range`. Zero-size rects are enough: nothing here
 * asserts on geometry, it just has to not throw. Scoped to this file rather
 * than the shared setup because this is the only suite that drives ProseMirror.
 */
beforeAll(() => {
  Range.prototype.getClientRects ??= () =>
    Object.assign([], { item: () => null }) as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect ??= () => new DOMRect();
});

/**
 * The editor is created on mount rather than during render, so every test waits
 * for the editable element before asserting on it.
 */
const renderEditor = async (
  props: Parameters<typeof RichTextEditor>[0] = {}
) => {
  const result = render(<RichTextEditor {...props} />);
  const textbox = await screen.findByRole("textbox");
  return { ...result, textbox };
};

describe("RichTextEditor", () => {
  it("renders the editable content as a multiline textbox", async () => {
    const { textbox } = await renderEditor({ label: "Bio" });

    expect(textbox).toHaveAttribute("aria-multiline", "true");
    expect(textbox).toHaveAttribute("contenteditable", "true");
  });

  it("names the editable element with the label, which no `for` could reach", async () => {
    await renderEditor({ label: "Bio" });

    expect(screen.getByRole("textbox", { name: "Bio" })).toBeInTheDocument();
  });

  it("renders no label wiring when there is no label", async () => {
    const { textbox } = await renderEditor();

    expect(textbox).not.toHaveAttribute("aria-labelledby");
  });

  it("renders the placeholder as data the empty-node style can read", async () => {
    await renderEditor({ label: "Bio", placeholder: "Tell us about yourself" });

    expect(
      document.querySelector('[data-placeholder="Tell us about yourself"]')
    ).toBeInTheDocument();
  });

  it("renders an uncontrolled default value", async () => {
    const { textbox } = await renderEditor({
      label: "Bio",
      defaultValue: "<p>Hello</p>",
    });

    expect(textbox).toHaveTextContent("Hello");
  });

  it("renders a controlled value", async () => {
    const { textbox } = await renderEditor({
      label: "Bio",
      value: "<p>Controlled</p>",
      onChange: vi.fn(),
    });

    expect(textbox).toHaveTextContent("Controlled");
  });

  it("associates the description with the editable element", async () => {
    await renderEditor({ label: "Bio", description: "Max 500 characters" });

    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "Max 500 characters"
    );
  });

  it("shows the error message and reports invalid when isInvalid", async () => {
    const { textbox } = await renderEditor({
      label: "Bio",
      isInvalid: true,
      errorMessage: "Too long",
    });

    expect(textbox).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Too long")).toBeInTheDocument();
  });

  it("does not render the error message when valid", async () => {
    const { textbox } = await renderEditor({
      label: "Bio",
      errorMessage: "Too long",
    });

    expect(screen.queryByText("Too long")).not.toBeInTheDocument();
    expect(textbox).not.toHaveAttribute("aria-invalid");
  });

  it("describes the editable element with both the description and the error", async () => {
    await renderEditor({
      label: "Bio",
      description: "Max 500 characters",
      isInvalid: true,
      errorMessage: "Too long",
    });

    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "Max 500 characters Too long"
    );
  });

  it("resolves a function error message against the validation result", async () => {
    await renderEditor({
      label: "Bio",
      isInvalid: true,
      errorMessage: ({ isInvalid }) => (isInvalid ? "Computed error" : "Fine"),
    });

    expect(screen.getByText("Computed error")).toBeInTheDocument();
  });

  it("marks the field required", async () => {
    const { textbox } = await renderEditor({ label: "Bio", isRequired: true });

    expect(textbox).toHaveAttribute("aria-required", "true");
  });

  it("makes the content uneditable when isDisabled", async () => {
    const { textbox } = await renderEditor({ label: "Bio", isDisabled: true });

    expect(textbox).toHaveAttribute("contenteditable", "false");
  });

  it("makes the content uneditable but announced read-only when isReadOnly", async () => {
    const { textbox } = await renderEditor({ label: "Bio", isReadOnly: true });

    expect(textbox).toHaveAttribute("aria-readonly", "true");
    expect(textbox).toHaveAttribute("contenteditable", "false");
  });

  describe("form submission", () => {
    it("renders no hidden input without a name", async () => {
      const { container } = await renderEditor({ label: "Bio" });

      expect(
        container.querySelector('input[type="hidden"]')
      ).not.toBeInTheDocument();
    });

    it("carries the value in a hidden input when named", async () => {
      const { container } = await renderEditor({
        label: "Bio",
        name: "bio",
        defaultValue: "<p>Hello</p>",
      });

      expect(container.querySelector('input[name="bio"]')).toHaveValue(
        "<p>Hello</p>"
      );
    });

    it("prefers the controlled value for the hidden input", async () => {
      const { container } = await renderEditor({
        label: "Bio",
        name: "bio",
        value: "<p>Controlled</p>",
        onChange: vi.fn(),
      });

      expect(container.querySelector('input[name="bio"]')).toHaveValue(
        "<p>Controlled</p>"
      );
    });
  });

  describe("toolbar", () => {
    it("renders the default formatting tools", async () => {
      await renderEditor({ label: "Bio" });

      for (const name of ["Bold", "Italic", "Underline", "Link", "Undo"]) {
        expect(screen.getByRole("button", { name })).toBeInTheDocument();
      }
    });

    it("renders only the tools the toolbar prop names, in that order", async () => {
      await renderEditor({
        label: "Bio",
        toolbar: [["italic", "bold"]],
      });

      const names = screen
        .getAllByRole("button")
        .map((button) => button.getAttribute("aria-label"));

      expect(names).toEqual(["Italic", "Bold"]);
    });

    it("renders a separator between groups but not before the first", async () => {
      const { container } = await renderEditor({
        label: "Bio",
        toolbar: [["bold"], ["italic"], ["underline"]],
      });

      expect(container.querySelectorAll(".react-aria-Separator")).toHaveLength(
        2
      );
    });

    it("renders no toolbar when every group is empty", async () => {
      await renderEditor({ label: "Bio", toolbar: [[], []] });

      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });

    it("renders no toolbar when the toolbar is empty", async () => {
      await renderEditor({ label: "Bio", toolbar: [] });

      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });

    it("reports each tool's pressed state, unpressed on empty content", async () => {
      await renderEditor({ label: "Bio", toolbar: [["bold"]] });

      expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    });

    it("disables every tool when the field is disabled", async () => {
      await renderEditor({
        label: "Bio",
        isDisabled: true,
        toolbar: [["bold", "italic"]],
      });

      expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Italic" })).toBeDisabled();
    });

    it("disables every tool when the field is read-only", async () => {
      await renderEditor({
        label: "Bio",
        isReadOnly: true,
        toolbar: [["bold"]],
      });

      expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
    });

    it("opens the link popover rather than running a command, since a link needs a URL", async () => {
      const user = userEvent.setup();
      await renderEditor({ label: "Bio", toolbar: [["link"]] });

      await user.click(screen.getByRole("button", { name: "Link" }));

      expect(
        await screen.findByRole("textbox", { name: "URL" })
      ).toBeInTheDocument();
    });
  });

  describe("size", () => {
    it.each(["sm", "md", "lg"] as const)(
      'renders data-field-size="%s" when specified',
      async (size) => {
        const { container } = await renderEditor({ label: "Bio", size });

        expect(container.querySelector("[data-field-size]")).toHaveAttribute(
          "data-field-size",
          size
        );
      }
    );

    it('renders data-field-size="md" by default', async () => {
      const { container } = await renderEditor({ label: "Bio" });

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "md"
      );
    });
  });

  describe("formatting", () => {
    it("marks a tool pressed once its formatting is applied", async () => {
      const user = userEvent.setup();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        toolbar: [["bold"]],
      });

      await user.click(screen.getByRole("button", { name: "Bold" }));

      expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });

    it("unpresses a tool when its formatting is toggled back off", async () => {
      const user = userEvent.setup();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        toolbar: [["heading1"]],
      });

      const heading = () => screen.getByRole("button", { name: "Heading 1" });
      await user.click(heading());
      await user.click(heading());

      expect(heading()).toHaveAttribute("aria-pressed", "false");
    });

    it("reports the document HTML through onChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [["heading1"]],
      });

      await user.click(screen.getByRole("button", { name: "Heading 1" }));

      // StarterKit's trailing-node extension keeps an empty paragraph after a
      // block node so there is always somewhere to type past it.
      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining("<h1>hello</h1>")
      );
    });

    it("sets an alignment, then clears it when the pressed button is pressed again", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [["alignCenter"]],
      });

      const alignCenter = () =>
        screen.getByRole("button", { name: "Align center" });

      await user.click(alignCenter());
      expect(alignCenter()).toHaveAttribute("aria-pressed", "true");

      await user.click(alignCenter());
      expect(alignCenter()).toHaveAttribute("aria-pressed", "false");
    });

    it("strips formatting with the clear tool", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<h1>hello</h1>",
        onChange,
        toolbar: [["clearFormatting"]],
      });

      await user.click(
        screen.getByRole("button", { name: "Clear formatting" })
      );

      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining("<p>hello</p>")
      );
    });

    it("disables undo until there is something to undo", async () => {
      const user = userEvent.setup();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        toolbar: [["undo", "heading1"]],
      });

      expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();

      await user.click(screen.getByRole("button", { name: "Heading 1" }));

      expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();
    });

    it("keeps the hidden input in step with the document", async () => {
      const user = userEvent.setup();
      const { container } = await renderEditor({
        label: "Bio",
        name: "bio",
        defaultValue: "<p>hello</p>",
        toolbar: [["heading1"]],
      });

      await user.click(screen.getByRole("button", { name: "Heading 1" }));

      const hidden =
        container.querySelector<HTMLInputElement>('input[name="bio"]');
      expect(hidden?.value).toContain("<h1>hello</h1>");
    });
  });

  describe("link", () => {
    it("inserts the URL as linked text when nothing is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [["link"]],
      });

      await user.click(screen.getByRole("button", { name: "Link" }));
      await user.type(
        await screen.findByRole("textbox", { name: "URL" }),
        "https://example.com"
      );
      await user.click(screen.getByRole("button", { name: "Add link" }));

      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining('href="https://example.com"')
      );
    });

    it("wraps the selected text rather than inserting the URL over it", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { textbox } = await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [["link"]],
      });

      textbox.focus();
      await user.keyboard("{Control>}a{/Control}");
      await user.click(screen.getByRole("button", { name: "Link" }));
      await user.type(
        await screen.findByRole("textbox", { name: "URL" }),
        "https://example.com"
      );
      await user.click(screen.getByRole("button", { name: "Add link" }));

      // StarterKit's Link renders target and rel before href, so the assertion
      // matches the attribute rather than the start of the tag.
      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining('href="https://example.com"')
      );
      expect(onChange).toHaveBeenCalledWith(
        expect.stringContaining(">hello</a>")
      );
      expect(screen.getByRole("button", { name: "Link" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });

    it("removes an existing link without asking for a URL again", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: '<p><a href="https://example.com">hello</a></p>',
        onChange,
        toolbar: [["link"]],
      });

      await user.click(screen.getByRole("button", { name: "Link" }));

      expect(
        screen.queryByRole("textbox", { name: "URL" })
      ).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledWith("<p>hello</p>");
    });

    it("closes the popover without applying anything when the URL is blank", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [["link"]],
      });

      await user.click(screen.getByRole("button", { name: "Link" }));
      await user.click(await screen.findByRole("button", { name: "Add link" }));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("every tool", () => {
    const ALL_TOOLS = Object.keys(TOOL_REGISTRY) as RichTextEditorTool[];

    it("renders a button for each tool the registry defines", async () => {
      await renderEditor({ label: "Bio", toolbar: [ALL_TOOLS] });

      for (const tool of ALL_TOOLS) {
        expect(
          screen.getByRole("button", { name: TOOL_REGISTRY[tool].label })
        ).toBeInTheDocument();
      }
    });

    it("reads a pressed and a disabled state for each tool without throwing", async () => {
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        toolbar: [ALL_TOOLS],
      });

      for (const tool of ALL_TOOLS) {
        const button = screen.getByRole("button", {
          name: TOOL_REGISTRY[tool].label,
        });
        expect(button, tool).toHaveAttribute("aria-pressed");
      }
    });

    // A mark applied to an empty selection is a stored mark rather than a
    // document change, so these are checked by their pressed state.
    const MARK_TOOLS: RichTextEditorTool[] = [
      "bold",
      "italic",
      "underline",
      "strike",
      "code",
      "highlight",
      "subscript",
      "superscript",
    ];

    it.each(MARK_TOOLS)("presses %s when its mark is applied", async (tool) => {
      const user = userEvent.setup();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        toolbar: [[tool]],
      });
      const { label } = TOOL_REGISTRY[tool];

      await user.click(screen.getByRole("button", { name: label }));

      expect(screen.getByRole("button", { name: label })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });

    const NODE_TOOLS: Array<[RichTextEditorTool, string]> = [
      ["heading1", "<h1>hello</h1>"],
      ["heading2", "<h2>hello</h2>"],
      ["heading3", "<h3>hello</h3>"],
      ["bulletList", "<ul>"],
      ["orderedList", "<ol>"],
      ["taskList", 'data-type="taskList"'],
      ["blockquote", "<blockquote>"],
      ["codeBlock", "<pre>"],
      ["horizontalRule", "<hr>"],
      ["alignLeft", "text-align: left"],
      ["alignCenter", "text-align: center"],
      ["alignRight", "text-align: right"],
      ["alignJustify", "text-align: justify"],
    ];

    it.each(NODE_TOOLS)("%s rewrites the document", async (tool, expected) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [[tool]],
      });

      await user.click(
        screen.getByRole("button", { name: TOOL_REGISTRY[tool].label })
      );

      expect(onChange).toHaveBeenCalledWith(expect.stringContaining(expected));
    });

    it("undoes and redoes a change", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        onChange,
        toolbar: [["undo", "redo", "heading1"]],
      });

      await user.click(screen.getByRole("button", { name: "Heading 1" }));
      await user.click(screen.getByRole("button", { name: "Undo" }));

      expect(onChange).toHaveBeenLastCalledWith(
        expect.stringContaining("<p>hello</p>")
      );

      await user.click(screen.getByRole("button", { name: "Redo" }));

      expect(onChange).toHaveBeenLastCalledWith(
        expect.stringContaining("<h1>hello</h1>")
      );
    });

    it("disables redo until something has been undone", async () => {
      await renderEditor({
        label: "Bio",
        defaultValue: "<p>hello</p>",
        toolbar: [["redo"]],
      });

      expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();
    });
  });

  it("focuses the editor when the label is clicked, which `for` cannot do", async () => {
    const user = userEvent.setup();
    const { textbox } = await renderEditor({ label: "Bio" });

    await user.click(screen.getByText("Bio"));

    // tiptap's focus command can defer to a frame, so this waits rather than
    // asserting synchronously.
    await waitFor(() => expect(textbox).toHaveFocus());
  });

  it("writes an updated controlled value back into the document", async () => {
    const { rerender, textbox } = await renderEditor({
      label: "Bio",
      value: "<p>first</p>",
      onChange: vi.fn(),
    });

    expect(textbox).toHaveTextContent("first");

    rerender(
      <RichTextEditor label="Bio" value="<p>second</p>" onChange={vi.fn()} />
    );

    expect(await screen.findByText("second")).toBeInTheDocument();
  });

  it("leaves the document alone when the controlled value already matches", async () => {
    const onChange = vi.fn();
    const { rerender } = await renderEditor({
      label: "Bio",
      value: "<p>same</p>",
      onChange,
    });

    rerender(
      <RichTextEditor label="Bio" value="<p>same</p>" onChange={onChange} />
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it("applies a custom className to the outermost element", async () => {
    const { container } = await renderEditor({
      label: "Bio",
      className: "custom",
    });

    expect(container.firstElementChild).toHaveClass("custom");
  });
});
