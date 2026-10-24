import { Editor } from "@tiptap/core";
import { Highlight } from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { StarterKit } from "@tiptap/starter-kit";
import { TOOL_REGISTRY } from "./toolRegistry";

const editors: Editor[] = [];
const createEditor = (content = "<p>Hello</p>") => {
  const editor = new Editor({
    extensions: [
      StarterKit,
      Highlight,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
  });
  editors.push(editor);
  return editor;
};

afterEach(() => {
  for (const editor of editors) editor.destroy();
  editors.length = 0;
});

describe("TOOL_REGISTRY", () => {
  it("gives every tool a label and an icon", () => {
    for (const [tool, definition] of Object.entries(TOOL_REGISTRY)) {
      expect(definition.label, tool).toBeTruthy();
      expect(definition.icon, tool).toBeDefined();
    }
  });

  it("gives every tool a unique label, since the label is its accessible name", () => {
    const labels = Object.values(TOOL_REGISTRY).map(({ label }) => label);

    expect(new Set(labels).size).toBe(labels.length);
  });

  it("reads tool state without changing the document or selection", () => {
    const editor = createEditor();
    editor.commands.setTextSelection({ from: 1, to: 6 });
    const document = editor.getJSON();
    const selection = editor.state.selection.toJSON();

    for (const tool of Object.values(TOOL_REGISTRY)) {
      expect(typeof tool.isActive(editor)).toBe("boolean");
      expect(typeof tool.isEnabled(editor)).toBe("boolean");
    }

    expect(editor.getJSON()).toEqual(document);
    expect(editor.state.selection.toJSON()).toEqual(selection);
  });

  it.each([
    ["bold", "bold"],
    ["italic", "italic"],
    ["underline", "underline"],
    ["strike", "strike"],
    ["code", "code"],
    ["highlight", "highlight"],
    ["subscript", "subscript"],
    ["superscript", "superscript"],
  ] as const)("applies and removes the %s mark", (name, mark) => {
    const editor = createEditor();
    editor.commands.setTextSelection({ from: 1, to: 6 });
    const tool = TOOL_REGISTRY[name];

    expect(tool.isEnabled(editor)).toBe(true);
    expect(tool.isActive(editor)).toBe(false);
    tool.run(editor);
    expect(tool.isActive(editor)).toBe(true);
    expect(editor.state.doc.firstChild?.firstChild?.marks[0].type.name).toBe(
      mark
    );

    tool.run(editor);
    expect(tool.isActive(editor)).toBe(false);
    expect(editor.state.doc.textContent).toBe("Hello");
  });

  it.each([
    "bulletList",
    "orderedList",
    "taskList",
    "blockquote",
    "codeBlock",
  ] as const)("toggles the %s node without losing its text", (name) => {
    const editor = createEditor();
    const tool = TOOL_REGISTRY[name];

    expect(tool.isEnabled(editor)).toBe(true);
    tool.run(editor);
    expect(tool.isActive(editor)).toBe(true);
    expect(editor.state.doc.firstChild?.type.name).toBe(name);

    tool.run(editor);
    expect(tool.isActive(editor)).toBe(false);
    expect(editor.state.doc.textContent).toBe("Hello");
  });

  it("enables undo and redo as document history changes", () => {
    const editor = createEditor();
    const before = editor.getJSON();
    expect(TOOL_REGISTRY.undo.isEnabled(editor)).toBe(false);
    expect(TOOL_REGISTRY.redo.isEnabled(editor)).toBe(false);

    editor.commands.insertContent("Updated ");
    const after = editor.getJSON();
    expect(TOOL_REGISTRY.undo.isEnabled(editor)).toBe(true);
    TOOL_REGISTRY.undo.run(editor);
    expect(editor.getJSON()).toEqual(before);

    expect(TOOL_REGISTRY.redo.isEnabled(editor)).toBe(true);
    TOOL_REGISTRY.redo.run(editor);
    expect(editor.getJSON()).toEqual(after);
  });

  it("inserts a horizontal rule", () => {
    const editor = createEditor();

    expect(TOOL_REGISTRY.horizontalRule.isEnabled(editor)).toBe(true);
    TOOL_REGISTRY.horizontalRule.run(editor);

    expect(editor.getJSON().content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "horizontalRule" }),
      ])
    );
    expect(TOOL_REGISTRY.horizontalRule.isActive(editor)).toBe(false);
  });

  it.each([
    ["alignLeft", "left"],
    ["alignCenter", "center"],
    ["alignRight", "right"],
    ["alignJustify", "justify"],
  ] as const)("sets and clears %s", (name, alignment) => {
    const editor = createEditor();
    const tool = TOOL_REGISTRY[name];

    expect(tool.isEnabled(editor)).toBe(true);
    tool.run(editor);
    expect(tool.isActive(editor)).toBe(true);
    expect(editor.state.doc.firstChild?.attrs.textAlign).toBe(alignment);

    tool.run(editor);
    expect(tool.isActive(editor)).toBe(false);
    expect(editor.state.doc.firstChild?.attrs.textAlign).toBeNull();
  });

  it.each([
    ["paragraph", "<p>Hello</p>", true],
    ["code block", "<pre><code>Hello</code></pre>", false],
    ["inline code", "<p><code>Hello</code></p>", false],
  ] as const)("checks link availability for a %s", (_, content, enabled) => {
    const editor = createEditor(content);

    for (const selection of [2, { from: 1, to: 6 }]) {
      editor.commands.setTextSelection(selection);
      expect(TOOL_REGISTRY.link.isEnabled(editor)).toBe(enabled);
    }
  });

  it("removes the entire active link while preserving its text", () => {
    const editor = createEditor(
      '<p><a href="https://example.com">Hello</a></p>'
    );
    editor.commands.setTextSelection(3);

    expect(TOOL_REGISTRY.link.isActive(editor)).toBe(true);
    expect(TOOL_REGISTRY.link.isEnabled(editor)).toBe(true);
    TOOL_REGISTRY.link.run(editor);

    expect(TOOL_REGISTRY.link.isActive(editor)).toBe(false);
    expect(editor.getHTML()).toBe("<p>Hello</p>");
  });

  it("clears block formatting and marks together", () => {
    const editor = createEditor("<h2><strong>Hello</strong></h2>");
    editor.commands.setTextSelection({ from: 1, to: 6 });

    expect(TOOL_REGISTRY.clearFormatting.isEnabled(editor)).toBe(true);
    TOOL_REGISTRY.clearFormatting.run(editor);

    expect(editor.state.doc.firstChild?.type.name).toBe("paragraph");
    expect(editor.isActive("bold")).toBe(false);
    expect(editor.state.doc.textContent).toBe("Hello");
    expect(TOOL_REGISTRY.clearFormatting.isActive(editor)).toBe(false);
  });
});
