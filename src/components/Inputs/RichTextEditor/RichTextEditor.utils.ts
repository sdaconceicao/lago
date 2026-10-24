import { type Editor, Extension, isTextSelection } from "@tiptap/core";
import type { ValidationResult } from "react-aria-components/TextField";
import type { RichTextEditorToolbar } from "./RichTextEditor.types";

/**
 * The toolbar a RichTextEditor renders when no `toolbar` prop is given: the
 * formatting a writer expects to find in a text editor, grouped so that related
 * controls stay together when they move into the overflow popover.
 */
export const DEFAULT_TOOLBAR: RichTextEditorToolbar = [
  ["undo", "redo"],
  ["heading"],
  ["bold", "italic", "underline", "strike", "code"],
  ["highlight", "subscript", "superscript"],
  ["link"],
  ["bulletList", "orderedList", "taskList"],
  ["blockquote", "codeBlock", "horizontalRule"],
  ["alignLeft", "alignCenter", "alignRight", "alignJustify"],
  ["clearFormatting"],
];

/**
 * Drops empty groups, so a toolbar built by filtering never renders an empty
 * group or a `Separator` with nothing on one side of it.
 */
export const normalizeToolbar = (
  toolbar: RichTextEditorToolbar
): RichTextEditorToolbar => toolbar.filter((group) => group.length > 0);

/**
 * Joins the ids of the elements describing the field, skipping the ones not
 * currently rendered. Returns `undefined` rather than an empty string so the
 * attribute is omitted instead of pointing at nothing.
 */
export const joinIds = (
  ...ids: Array<string | false | undefined>
): string | undefined => {
  const present = ids.filter((id): id is string => Boolean(id));
  return present.length > 0 ? present.join(" ") : undefined;
};

export interface EditorAttributesOptions {
  /** Class applied to the ProseMirror root, which is the editable element. */
  className: string;
  /** IDs of the visible and external labels, if provided. */
  labelId?: string;
  /** Accessible name used when no referenced label is present. */
  ariaLabel?: string;
  /** Ids of the description and error message, if rendered. */
  describedBy?: string;
  isInvalid?: boolean;
  isRequired?: boolean;
  /** Prevents keyboard focus even when the field is also read-only. */
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

/**
 * The ARIA contract for the editable element.
 *
 * tiptap renders a plain `contenteditable` div, which carries no implicit role
 * and cannot be the target of a `<label for>`, so the role, the multiline flag,
 * and the whole label/description/validation wiring have to be stated here.
 * They go on this element rather than a wrapper because this is the element that
 * receives focus and typing, and so the one a screen reader announces.
 */
export const buildEditorAttributes = ({
  className,
  labelId,
  ariaLabel,
  describedBy,
  isInvalid,
  isRequired,
  isDisabled,
  isReadOnly,
}: EditorAttributesOptions): Record<string, string> => {
  const attributes: Record<string, string> = {
    class: className,
    role: "textbox",
    "aria-multiline": "true",
  };

  if (labelId) attributes["aria-labelledby"] = labelId;
  if (ariaLabel) attributes["aria-label"] = ariaLabel;
  if (describedBy) attributes["aria-describedby"] = describedBy;
  if (isInvalid) attributes["aria-invalid"] = "true";
  if (isRequired) attributes["aria-required"] = "true";
  if (isReadOnly) attributes["aria-readonly"] = "true";
  if (isReadOnly && !isDisabled) attributes.tabindex = "0";

  return attributes;
};

/**
 * A `ValidityState` for an error the consumer supplied rather than one the
 * platform detected. There is no native input behind the editor to read a real
 * one from, and `FieldError` requires the whole `ValidationResult` shape.
 */
const CUSTOM_ERROR_VALIDITY: ValidityState = {
  badInput: false,
  customError: true,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valid: false,
  valueMissing: false,
};

const VALID_VALIDITY: ValidityState = {
  ...CUSTOM_ERROR_VALIDITY,
  customError: false,
  valid: true,
};

/**
 * The value `FieldErrorContext` needs for lago's `FieldError` to render.
 *
 * `FieldError` returns `null` unless that context reports `isInvalid`, and the
 * context normally comes from a react-aria field wrapping a native input.
 * There is no such input here, so the editor supplies the context itself from
 * its own `isInvalid` and `errorMessage` props.
 */
export const buildValidation = (
  isInvalid: boolean | undefined,
  errorMessage: string | ((validation: ValidationResult) => string) | undefined
): ValidationResult => {
  if (!isInvalid) {
    return {
      isInvalid: false,
      validationErrors: [],
      validationDetails: VALID_VALIDITY,
    };
  }

  return {
    isInvalid: true,
    // A function `errorMessage` is resolved by FieldError's own render props,
    // so only a plain string belongs in the default children.
    validationErrors: typeof errorMessage === "string" ? [errorMessage] : [],
    validationDetails: CUSTOM_ERROR_VALIDITY,
  };
};

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
