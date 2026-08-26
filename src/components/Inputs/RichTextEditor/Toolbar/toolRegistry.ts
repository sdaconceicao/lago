import type { LucideIcon } from "lucide-react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
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

/** Tools that are always available, so there is nothing to ask the editor. */
const alwaysEnabled = () => true;

/** Tools that apply a command rather than a state, so are never "pressed". */
const neverActive = () => false;

/**
 * The four alignment tools differ only in the alignment they set, and each is
 * rendered as a toggle, so pressing the active one clears the alignment rather
 * than setting it again — otherwise a pressed button would refuse to unpress.
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
 * Every tool, in one table.
 *
 * Each entry is the whole behaviour of one button — its name, its icon, how to
 * read its pressed state off the document, and what to run when it is pressed —
 * so the toolbar renders any tool without knowing what that tool does, and
 * adding a tool means adding a row here rather than a branch there.
 *
 * `isEnabled` asks tiptap whether the command could run at the current
 * selection, which is how a button greys out inside a code block instead of
 * silently doing nothing.
 */
export const TOOL_REGISTRY: Record<
  RichTextEditorTool,
  RichTextEditorToolDefinition
> = {
  undo: {
    label: "Undo",
    icon: Undo2,
    isActive: neverActive,
    isEnabled: (editor) => editor.can().chain().undo().run(),
    run: (editor) => {
      editor.chain().focus().undo().run();
    },
  },
  redo: {
    label: "Redo",
    icon: Redo2,
    isActive: neverActive,
    isEnabled: (editor) => editor.can().chain().redo().run(),
    run: (editor) => {
      editor.chain().focus().redo().run();
    },
  },
  heading1: {
    label: "Heading 1",
    icon: Heading1,
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
    isEnabled: (editor) =>
      editor.can().chain().toggleHeading({ level: 1 }).run(),
    run: (editor) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    },
  },
  heading2: {
    label: "Heading 2",
    icon: Heading2,
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
    isEnabled: (editor) =>
      editor.can().chain().toggleHeading({ level: 2 }).run(),
    run: (editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    },
  },
  heading3: {
    label: "Heading 3",
    icon: Heading3,
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
    isEnabled: (editor) =>
      editor.can().chain().toggleHeading({ level: 3 }).run(),
    run: (editor) => {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    },
  },
  bold: {
    label: "Bold",
    icon: Bold,
    isActive: (editor) => editor.isActive("bold"),
    isEnabled: (editor) => editor.can().chain().toggleBold().run(),
    run: (editor) => {
      editor.chain().focus().toggleBold().run();
    },
  },
  italic: {
    label: "Italic",
    icon: Italic,
    isActive: (editor) => editor.isActive("italic"),
    isEnabled: (editor) => editor.can().chain().toggleItalic().run(),
    run: (editor) => {
      editor.chain().focus().toggleItalic().run();
    },
  },
  underline: {
    label: "Underline",
    icon: Underline,
    isActive: (editor) => editor.isActive("underline"),
    isEnabled: (editor) => editor.can().chain().toggleUnderline().run(),
    run: (editor) => {
      editor.chain().focus().toggleUnderline().run();
    },
  },
  strike: {
    label: "Strikethrough",
    icon: Strikethrough,
    isActive: (editor) => editor.isActive("strike"),
    isEnabled: (editor) => editor.can().chain().toggleStrike().run(),
    run: (editor) => {
      editor.chain().focus().toggleStrike().run();
    },
  },
  code: {
    label: "Inline code",
    icon: Code,
    isActive: (editor) => editor.isActive("code"),
    isEnabled: (editor) => editor.can().chain().toggleCode().run(),
    run: (editor) => {
      editor.chain().focus().toggleCode().run();
    },
  },
  highlight: {
    label: "Highlight",
    icon: Highlighter,
    isActive: (editor) => editor.isActive("highlight"),
    isEnabled: (editor) => editor.can().chain().toggleHighlight().run(),
    run: (editor) => {
      editor.chain().focus().toggleHighlight().run();
    },
  },
  subscript: {
    label: "Subscript",
    icon: Subscript,
    isActive: (editor) => editor.isActive("subscript"),
    isEnabled: (editor) => editor.can().chain().toggleSubscript().run(),
    run: (editor) => {
      editor.chain().focus().toggleSubscript().run();
    },
  },
  superscript: {
    label: "Superscript",
    icon: Superscript,
    isActive: (editor) => editor.isActive("superscript"),
    isEnabled: (editor) => editor.can().chain().toggleSuperscript().run(),
    run: (editor) => {
      editor.chain().focus().toggleSuperscript().run();
    },
  },
  // A link needs a URL, which a button press cannot supply, so the toolbar
  // intercepts this one and opens a Popover to ask for it. Removing a link
  // needs no input, so that half is a plain command and lives here.
  link: {
    label: "Link",
    icon: Link,
    isActive: (editor) => editor.isActive("link"),
    isEnabled: alwaysEnabled,
    run: (editor) => {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    },
  },
  bulletList: {
    label: "Bulleted list",
    icon: List,
    isActive: (editor) => editor.isActive("bulletList"),
    isEnabled: (editor) => editor.can().chain().toggleBulletList().run(),
    run: (editor) => {
      editor.chain().focus().toggleBulletList().run();
    },
  },
  orderedList: {
    label: "Numbered list",
    icon: ListOrdered,
    isActive: (editor) => editor.isActive("orderedList"),
    isEnabled: (editor) => editor.can().chain().toggleOrderedList().run(),
    run: (editor) => {
      editor.chain().focus().toggleOrderedList().run();
    },
  },
  taskList: {
    label: "Task list",
    icon: ListTodo,
    isActive: (editor) => editor.isActive("taskList"),
    isEnabled: (editor) => editor.can().chain().toggleTaskList().run(),
    run: (editor) => {
      editor.chain().focus().toggleTaskList().run();
    },
  },
  blockquote: {
    label: "Blockquote",
    icon: TextQuote,
    isActive: (editor) => editor.isActive("blockquote"),
    isEnabled: (editor) => editor.can().chain().toggleBlockquote().run(),
    run: (editor) => {
      editor.chain().focus().toggleBlockquote().run();
    },
  },
  codeBlock: {
    label: "Code block",
    icon: SquareCode,
    isActive: (editor) => editor.isActive("codeBlock"),
    isEnabled: (editor) => editor.can().chain().toggleCodeBlock().run(),
    run: (editor) => {
      editor.chain().focus().toggleCodeBlock().run();
    },
  },
  horizontalRule: {
    label: "Horizontal rule",
    icon: Minus,
    isActive: neverActive,
    isEnabled: (editor) => editor.can().chain().setHorizontalRule().run(),
    run: (editor) => {
      editor.chain().focus().setHorizontalRule().run();
    },
  },
  alignLeft: alignTool("left", "Align left", TextAlignStart),
  alignCenter: alignTool("center", "Align center", TextAlignCenter),
  alignRight: alignTool("right", "Align right", TextAlignEnd),
  alignJustify: alignTool("justify", "Justify", TextAlignJustify),
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
