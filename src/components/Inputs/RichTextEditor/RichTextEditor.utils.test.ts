import { Editor } from "@tiptap/core";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { StarterKit } from "@tiptap/starter-kit";
import type { ValidationResult } from "react-aria-components/TextField";
import type { RichTextEditorToolbar } from "./RichTextEditor.types";
import {
  buildEditorAttributes,
  buildValidation,
  DEFAULT_TOOLBAR,
  joinIds,
  liftMixedListItems,
  MixedListIndentation,
  normalizeToolbar,
} from "./RichTextEditor.utils";
import { TOOL_REGISTRY } from "./Tools/toolRegistry";

describe("DEFAULT_TOOLBAR", () => {
  it("contains no empty groups", () => {
    expect(DEFAULT_TOOLBAR.every((group) => group.length > 0)).toBe(true);
  });

  it("names only tools the registry defines", () => {
    for (const tool of DEFAULT_TOOLBAR.flat()) {
      if (tool !== "heading") expect(TOOL_REGISTRY[tool]).toBeDefined();
    }
  });

  it("never repeats a tool", () => {
    const tools = DEFAULT_TOOLBAR.flat();
    expect(new Set(tools).size).toBe(tools.length);
  });

  it("covers the common formatting marks", () => {
    const tools = DEFAULT_TOOLBAR.flat();
    expect(tools).toEqual(
      expect.arrayContaining([
        "heading",
        "bold",
        "italic",
        "underline",
        "strike",
        "link",
        "bulletList",
        "orderedList",
        "blockquote",
        "codeBlock",
        "undo",
        "redo",
      ])
    );
  });
});

describe("normalizeToolbar", () => {
  it("drops empty groups", () => {
    const toolbar: RichTextEditorToolbar = [["bold"], [], ["italic"]];

    expect(normalizeToolbar(toolbar)).toEqual([["bold"], ["italic"]]);
  });

  it("preserves group order and contents", () => {
    const toolbar: RichTextEditorToolbar = [
      ["italic", "bold"],
      ["undo", "redo"],
    ];

    expect(normalizeToolbar(toolbar)).toEqual(toolbar);
  });

  it("returns an empty array when every group is empty", () => {
    expect(normalizeToolbar([[], []])).toEqual([]);
  });

  it("handles an empty toolbar", () => {
    expect(normalizeToolbar([])).toEqual([]);
  });

  it("does not mutate the toolbar it is given", () => {
    const toolbar: RichTextEditorToolbar = [["bold"], []];

    normalizeToolbar(toolbar);

    expect(toolbar).toEqual([["bold"], []]);
  });
});

describe("joinIds", () => {
  it("joins the ids that are present", () => {
    expect(joinIds("a", "b")).toBe("a b");
  });

  it("skips false and undefined", () => {
    expect(joinIds("a", false, undefined, "b")).toBe("a b");
  });

  it("returns undefined when nothing is present", () => {
    expect(joinIds(false, undefined)).toBeUndefined();
  });

  it("returns undefined when called with nothing", () => {
    expect(joinIds()).toBeUndefined();
  });

  it("returns a single id unchanged", () => {
    expect(joinIds("only")).toBe("only");
  });
});

describe("buildEditorAttributes", () => {
  it("always names the element a multiline textbox", () => {
    expect(buildEditorAttributes({ className: "content" })).toEqual({
      class: "content",
      role: "textbox",
      "aria-multiline": "true",
    });
  });

  it("wires the label and description when they are rendered", () => {
    const attributes = buildEditorAttributes({
      className: "content",
      labelId: "label-id",
      describedBy: "description-id error-id",
    });

    expect(attributes["aria-labelledby"]).toBe("label-id");
    expect(attributes["aria-describedby"]).toBe("description-id error-id");
  });

  it("reports the validation and required states", () => {
    const attributes = buildEditorAttributes({
      className: "content",
      isInvalid: true,
      isRequired: true,
      isReadOnly: true,
    });

    expect(attributes["aria-invalid"]).toBe("true");
    expect(attributes["aria-required"]).toBe("true");
    expect(attributes["aria-readonly"]).toBe("true");
  });

  it("forwards an accessible name without label references", () => {
    const attributes = buildEditorAttributes({
      className: "content",
      ariaLabel: "Biography",
    });

    expect(attributes["aria-label"]).toBe("Biography");
    expect(attributes).not.toHaveProperty("aria-labelledby");
  });

  it("omits the state attributes when the states are false", () => {
    const attributes = buildEditorAttributes({
      className: "content",
      isInvalid: false,
      isRequired: false,
      isReadOnly: false,
    });

    expect(attributes).not.toHaveProperty("aria-invalid");
    expect(attributes).not.toHaveProperty("aria-required");
    expect(attributes).not.toHaveProperty("aria-readonly");
  });

  it("omits the label wiring when there is no label", () => {
    const attributes = buildEditorAttributes({
      className: "content",
      labelId: undefined,
      describedBy: undefined,
    });

    expect(attributes).not.toHaveProperty("aria-labelledby");
    expect(attributes).not.toHaveProperty("aria-describedby");
  });

  it("is deterministic for the same options", () => {
    const options = { className: "content", labelId: "label-id" };

    expect(buildEditorAttributes(options)).toEqual(
      buildEditorAttributes(options)
    );
  });
});

describe("buildValidation", () => {
  it("reports valid when the field is not invalid", () => {
    const validation = buildValidation(undefined, "Too long");

    expect(validation.isInvalid).toBe(false);
    expect(validation.validationErrors).toEqual([]);
    expect(validation.validationDetails.valid).toBe(true);
    expect(validation.validationDetails.customError).toBe(false);
  });

  it("reports valid when isInvalid is explicitly false", () => {
    expect(buildValidation(false, "Too long").isInvalid).toBe(false);
  });

  it("carries a string error message through as the default children", () => {
    const validation = buildValidation(true, "Too long");

    expect(validation.isInvalid).toBe(true);
    expect(validation.validationErrors).toEqual(["Too long"]);
    expect(validation.validationDetails.customError).toBe(true);
    expect(validation.validationDetails.valid).toBe(false);
  });

  it("leaves the errors empty for a function error message, which FieldError resolves itself", () => {
    const errorMessage = (validation: ValidationResult) =>
      validation.isInvalid ? "Invalid" : "";

    expect(buildValidation(true, errorMessage).validationErrors).toEqual([]);
  });

  it("is invalid with no message when none is given", () => {
    const validation = buildValidation(true, undefined);

    expect(validation.isInvalid).toBe(true);
    expect(validation.validationErrors).toEqual([]);
  });
});

const editors: Editor[] = [];
const createEditor = (content: string) => {
  const editor = new Editor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      MixedListIndentation,
    ],
    content,
  });
  editors.push(editor);
  return editor;
};

const textPosition = (editor: Editor, text: string, offset = 0) => {
  let position = -1;
  editor.state.doc.descendants((node, pos) => {
    if (node.isText && node.text === text) position = pos + offset;
  });
  if (position < 0) throw new Error(`Missing text: ${text}`);
  return position;
};

afterEach(() => {
  for (const editor of editors) editor.destroy();
  editors.length = 0;
});

describe("liftMixedListItems", () => {
  it.each([
    "<p>Child</p>",
    '<ul data-type="taskList"><li data-type="taskItem"><p>Child</p></li></ul>',
    '<ul data-type="taskList"><li data-type="taskItem"><p>Parent</p><ul data-type="taskList"><li data-type="taskItem"><p>Child</p></li></ul></li></ul>',
    '<ul><li><p>Parent</p><blockquote><ul data-type="taskList"><li data-type="taskItem"><p>Child</p></li></ul></blockquote></li></ul>',
  ])(
    "leaves non-mixed-list handling to the default shortcuts (%s)",
    (content) => {
      const editor = createEditor(content);
      editor.commands.setTextSelection(textPosition(editor, "Child"));
      const before = editor.getJSON();

      expect(liftMixedListItems(editor)).toBe(false);
      expect(editor.getJSON()).toEqual(before);
    }
  );

  it("ignores non-text selections", () => {
    const editor = createEditor("<ul><li><p>Child</p></li></ul>");
    editor.commands.setNodeSelection(0);
    const before = editor.getJSON();

    expect(liftMixedListItems(editor)).toBe(false);
    expect(editor.getJSON()).toEqual(before);
  });

  it("does not modify read-only content", () => {
    const editor = createEditor(
      '<ul><li><p>Parent</p><ul data-type="taskList"><li data-type="taskItem"><p>Child</p></li></ul></li></ul>'
    );
    editor.commands.setTextSelection(textPosition(editor, "Child"));
    editor.setEditable(false);
    const before = editor.getJSON();

    expect(liftMixedListItems(editor)).toBe(false);
    expect(editor.getJSON()).toEqual(before);
  });

  it.each(["ul", "ol"])(
    "converts a nested %s item into an unchecked parent task item",
    (listTag) => {
      const editor = createEditor(
        `<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Parent</p><${listTag}><li><p>Child</p></li></${listTag}></li></ul>`
      );
      editor.commands.setTextSelection(textPosition(editor, "Child", 2));

      expect(liftMixedListItems(editor)).toBe(true);

      const list = editor.state.doc.firstChild;
      expect(list?.type.name).toBe("taskList");
      expect(list?.childCount).toBe(2);
      expect(list?.child(0).attrs.checked).toBe(true);
      expect(list?.child(1).type.name).toBe("taskItem");
      expect(list?.child(1).attrs.checked).toBe(false);
      expect(list?.child(1).textContent).toBe("Child");
      expect(editor.state.selection.$from.parentOffset).toBe(2);
      editor.state.doc.check();
    }
  );

  it("preserves a backward selection across multiple lifted rows and undoes in one step", () => {
    const editor = createEditor(
      '<ol start="5"><li><p>Parent</p><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Before</p></li><li data-type="taskItem"><p>First</p></li><li data-type="taskItem"><p>Second</p></li><li data-type="taskItem" data-checked="true"><p>After</p></li></ul></li><li><p>Sibling</p></li></ol>'
    );
    editor.commands.setTextSelection({
      from: textPosition(editor, "Second", 4),
      to: textPosition(editor, "First", 1),
    });
    const before = editor.getJSON();
    const selected = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );

    expect(liftMixedListItems(editor)).toBe(true);

    const list = editor.state.doc.firstChild;
    expect(list?.attrs.start).toBe(5);
    expect(list?.childCount).toBe(4);
    expect(list?.child(1).textContent).toBe("First");
    expect(list?.child(2).textContent).toBe("SecondAfter");
    expect(editor.state.selection.anchor).toBeGreaterThan(
      editor.state.selection.head
    );
    expect(
      editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to
      )
    ).toBe(selected);
    editor.state.doc.check();

    expect(editor.commands.undo()).toBe(true);
    expect(editor.getJSON()).toEqual(before);
  });

  it.each([false, true])(
    "keeps paragraphs together without adding empty tasks (preceding rows: %s)",
    (hasPrecedingRows) => {
      const before = hasPrecedingRows
        ? '<li data-type="taskItem" data-checked="true"><p>Before</p></li>'
        : "";
      const editor = createEditor(
        `<ul><li><p>Parent</p><ul data-type="taskList">${before}<li data-type="taskItem"><p>First</p><p>Second</p></li><li data-type="taskItem" data-checked="true"><p>After</p></li></ul><p>Tail</p></li></ul>`
      );
      editor.commands.setTextSelection(textPosition(editor, "First", 2));

      expect(liftMixedListItems(editor)).toBe(true);

      const list = editor.state.doc.firstChild;
      expect(list?.childCount).toBe(3);
      const lifted = list?.child(1);
      expect(lifted?.child(0).textContent).toBe("First");
      expect(lifted?.child(1).textContent).toBe("Second");
      expect(list?.child(2).textContent).toBe("Tail");
      const tasks: string[] = [];
      editor.state.doc.descendants((node) => {
        if (node.type.name === "taskItem") tasks.push(node.textContent);
      });
      expect(tasks).toEqual(hasPrecedingRows ? ["Before", "After"] : ["After"]);
      expect(editor.state.selection.$from.parentOffset).toBe(2);
      editor.state.doc.check();
    }
  );
});
