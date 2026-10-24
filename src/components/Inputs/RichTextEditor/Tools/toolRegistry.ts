import type { LucideIcon } from "lucide-react";
import {
  Bold,
  Code,
  Highlighter,
  Italic,
  Link,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Redo2,
  RemoveFormatting,
  SquareCode,
  Strikethrough,
  Subscript,
  Superscript,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignJustify,
  TextAlignStart,
  TextQuote,
  Underline,
  Undo2,
} from "lucide-react";
import type {
  RichTextEditorTool,
  RichTextEditorToolDefinition,
} from "../RichTextEditor.types";

/** Tools that apply a command rather than a state, so are never "pressed". */
const neverActive = () => false;

/** The argument-free toggle commands the registry drives. */
type ToggleCommand =
  | "toggleBold"
  | "toggleItalic"
  | "toggleUnderline"
  | "toggleStrike"
  | "toggleCode"
  | "toggleHighlight"
  | "toggleSubscript"
  | "toggleSuperscript"
  | "toggleBulletList"
  | "toggleOrderedList"
  | "toggleTaskList"
  | "toggleBlockquote"
  | "toggleCodeBlock";

/** The argument-free one-shot commands the registry drives. */
type OneShotCommand = "undo" | "redo" | "setHorizontalRule";

/**
 * A mark or node that toggles on and off: pressed while it is active at the
 * selection, disabled when tiptap reports the command cannot run there.
 */
const toggleTool = (
  name: string,
  command: ToggleCommand,
  label: string,
  icon: LucideIcon
): RichTextEditorToolDefinition => ({
  label,
  icon,
  isActive: (editor) => editor.isActive(name),
  isEnabled: (editor) => editor.can().chain()[command]().run(),
  run: (editor) => {
    editor.chain().focus()[command]().run();
  },
});

/** A command that acts once and holds no state of its own. */
const commandTool = (
  command: OneShotCommand,
  label: string,
  icon: LucideIcon
): RichTextEditorToolDefinition => ({
  label,
  icon,
  isActive: neverActive,
  isEnabled: (editor) => editor.can().chain()[command]().run(),
  run: (editor) => {
    editor.chain().focus()[command]().run();
  },
});

/**
 * Alignment is rendered as a toggle, so pressing the active one clears the
 * alignment rather than setting it again — otherwise a pressed button would
 * refuse to unpress.
 */
const alignTool = (
  alignment: "left" | "center" | "right" | "justify",
  label: string,
  icon: LucideIcon
): RichTextEditorToolDefinition => ({
  label,
  icon,
  isActive: (editor) => editor.isActive({ textAlign: alignment }),
  isEnabled: (editor) => editor.can().chain().setTextAlign(alignment).run(),
  run: (editor) => {
    const chain = editor.chain().focus();
    if (editor.isActive({ textAlign: alignment })) {
      chain.unsetTextAlign().run();
      return;
    }
    chain.setTextAlign(alignment).run();
  },
});

/**
 * The icon button commands, in one table. Heading styles use their own select.
 *
 * Each entry is the whole behaviour of one button — its name, its icon, how to
 * read its pressed state off the document, and what to run when it is pressed —
 * so the toolbar renders any tool without knowing what that tool does, and
 * adding a tool means adding a row here rather than a branch there.
 *
 * The factories above give the rows that share a shape one definition of it,
 * which is what keeps `isEnabled` from being derived eighteen slightly
 * different ways. Only the two tools that genuinely differ are written out.
 */
export const TOOL_REGISTRY: Record<
  Exclude<RichTextEditorTool, "heading">,
  RichTextEditorToolDefinition
> = {
  undo: commandTool("undo", "Undo", Undo2),
  redo: commandTool("redo", "Redo", Redo2),
  bold: toggleTool("bold", "toggleBold", "Bold", Bold),
  italic: toggleTool("italic", "toggleItalic", "Italic", Italic),
  underline: toggleTool("underline", "toggleUnderline", "Underline", Underline),
  strike: toggleTool("strike", "toggleStrike", "Strikethrough", Strikethrough),
  code: toggleTool("code", "toggleCode", "Inline code", Code),
  highlight: toggleTool(
    "highlight",
    "toggleHighlight",
    "Highlight",
    Highlighter
  ),
  subscript: toggleTool("subscript", "toggleSubscript", "Subscript", Subscript),
  superscript: toggleTool(
    "superscript",
    "toggleSuperscript",
    "Superscript",
    Superscript
  ),
  // A link needs a URL, which a button press cannot supply, so the toolbar
  // intercepts this one and opens a Popover. Removing a link needs no input,
  // so that half is a plain command and lives here.
  link: {
    label: "Link",
    icon: Link,
    isActive: (editor) => editor.isActive("link"),
    isEnabled: (editor) => editor.can().setMark("link"),
    run: (editor) => {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    },
  },
  bulletList: toggleTool(
    "bulletList",
    "toggleBulletList",
    "Bulleted list",
    List
  ),
  orderedList: toggleTool(
    "orderedList",
    "toggleOrderedList",
    "Numbered list",
    ListOrdered
  ),
  taskList: toggleTool("taskList", "toggleTaskList", "Task list", ListTodo),
  blockquote: toggleTool(
    "blockquote",
    "toggleBlockquote",
    "Blockquote",
    TextQuote
  ),
  codeBlock: toggleTool(
    "codeBlock",
    "toggleCodeBlock",
    "Code block",
    SquareCode
  ),
  horizontalRule: commandTool("setHorizontalRule", "Horizontal rule", Minus),
  alignLeft: alignTool("left", "Align left", TextAlignStart),
  alignCenter: alignTool("center", "Align center", TextAlignCenter),
  alignRight: alignTool("right", "Align right", TextAlignEnd),
  alignJustify: alignTool("justify", "Justify", TextAlignJustify),
  // Two commands rather than one, so it does not fit the one-shot factory.
  clearFormatting: {
    label: "Clear formatting",
    icon: RemoveFormatting,
    isActive: neverActive,
    isEnabled: (editor) =>
      editor.can().chain().unsetAllMarks().clearNodes().run(),
    run: (editor) => {
      editor.chain().focus().unsetAllMarks().clearNodes().run();
    },
  },
};
