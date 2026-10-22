import { Editor } from "@tiptap/core";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { StarterKit } from "@tiptap/starter-kit";
import {
  liftMixedListItems,
  MixedListIndentation,
} from "./RichTextEditorListKeys";

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
