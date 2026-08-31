import type { Editor } from "@tiptap/core";
import type { LucideIcon } from "lucide-react";

/**
 * Every formatting control the toolbar can render, named after the command it
 * runs rather than the icon it shows, so a consumer reordering the toolbar
 * names the behaviour they want and not a picture.
 */
export type RichTextEditorTool =
  | "undo"
  | "redo"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "highlight"
  | "subscript"
  | "superscript"
  | "link"
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "blockquote"
  | "codeBlock"
  | "horizontalRule"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "alignJustify"
  | "clearFormatting";

/**
 * The toolbar layout: an ordered list of groups, each an ordered list of tools.
 * Every group renders as one segmented `ToggleButtonGroup`, with a `Separator`
 * between groups.
 *
 * Because the array is both ordered and explicit it controls which tools appear
 * as well as the order they appear in — omitting a tool hides its button. That
 * is one prop doing two jobs on purpose: a toolbar is a list, and a list of
 * what is the same thing as a list in what order.
 *
 * Hiding a button does not remove the underlying formatting: the extension set
 * is fixed, so the keyboard shortcut still works and pasted content keeps its
 * marks. Deriving extensions from this prop instead would force the editor to
 * be torn down and rebuilt — losing content and selection — every time the
 * toolbar changed.
 */
export type RichTextEditorToolbar = RichTextEditorTool[][];

/** How one tool renders, and what pressing it does to the document. */
export interface RichTextEditorToolDefinition {
  /** Accessible name for the icon-only button. */
  label: string;
  /** The icon rendered inside the button. */
  icon: LucideIcon;
  /** Whether the mark or node this tool applies is active at the selection. */
  isActive: (editor: Editor) => boolean;
  /** Whether this tool's command can run against the current selection. */
  isEnabled: (editor: Editor) => boolean;
  /** Runs this tool's command. */
  run: (editor: Editor) => void;
}
