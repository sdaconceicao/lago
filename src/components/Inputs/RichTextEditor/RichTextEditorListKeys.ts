import { type Editor, Extension, isTextSelection } from "@tiptap/core";

const LIST_ITEMS: Record<string, string> = {
  bulletList: "listItem",
  orderedList: "listItem",
  taskList: "taskItem",
};

/** Lifts only the selected rows across a task/regular-list boundary. */
export const liftMixedListItems = (editor: Editor): boolean => {
  const { state } = editor;
  const { selection } = state;
  if (!editor.isEditable || !isTextSelection(selection)) return false;

  const { $from, $to } = selection;
  const range = $from.blockRange($to, (node) =>
    Boolean(LIST_ITEMS[node.type.name])
  );
  if (!range || range.depth < 3) return false;

  const parentItem = $from.node(range.depth - 1);
  const parentList = $from.node(range.depth - 2);
  if (
    LIST_ITEMS[parentList.type.name] !== parentItem.type.name ||
    range.parent.child(0).type === parentItem.type
  )
    return false;

  const after = range.parent.content.cut(range.end - $from.start(range.depth));
  const liftedItems = Array.from(
    { length: range.endIndex - range.startIndex },
    (_, index) => {
      const item = range.parent.child(range.startIndex + index);
      // Following rows stay nested, retaining their original list type.
      const content =
        index === range.endIndex - range.startIndex - 1 && after.size > 0
          ? item.content.addToEnd(range.parent.copy(after))
          : item.content;
      return parentItem.type.create(item.attrs, content, item.marks);
    }
  );
  const hasPrecedingRows = range.startIndex > 0;
  // Closing a retained source list adds two tokens before the lifted rows.
  const offset = hasPrecedingRows ? 2 : 0;
  return editor.commands.command(({ tr, commands }) => {
    // ProseMirror fits the converted rows directly into the outer list.
    tr.replaceWith(
      hasPrecedingRows ? range.start : $from.before(range.depth),
      $to.after(range.depth),
      liftedItems
    );
    commands.setTextSelection({
      from: selection.anchor + offset,
      to: selection.head + offset,
    });
    tr.scrollIntoView();
    return true;
  });
};

/** Handles mixed lists before the default same-type list shortcuts. */
export const MixedListIndentation = Extension.create({
  name: "mixedListIndentation",
  priority: 1000,
  addKeyboardShortcuts() {
    return {
      "Shift-Tab": () => liftMixedListItems(this.editor),
    };
  },
});
