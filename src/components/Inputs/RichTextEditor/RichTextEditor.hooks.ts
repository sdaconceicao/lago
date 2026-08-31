"use client";
import type { Editor, Extensions } from "@tiptap/core";
import { Highlight } from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";

/**
 * The extension set every RichTextEditor registers, whatever its toolbar shows.
 *
 * StarterKit already carries most of it — bold, italic, underline, strike, code,
 * code block, headings, blockquote, horizontal rule, both lists, links, and
 * undo/redo — so only what sits outside it is added here.
 *
 * The set is fixed rather than derived from the `toolbar` prop, because changing
 * a tiptap editor's extensions means recreating it and losing the document. See
 * {@link RichTextEditorToolbar}. `placeholder` is read through a getter for the
 * same reason: a changed prop then needs no new editor.
 */
const buildExtensions = (getPlaceholder: () => string): Extensions => [
  StarterKit,
  TaskList,
  TaskItem.configure({ nested: true }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Highlight,
  Subscript,
  Superscript,
  Placeholder.configure({ placeholder: () => getPlaceholder() }),
];

export interface UseRichTextEditorOptions {
  /** ARIA and class attributes for the editable element. */
  attributes: Record<string, string>;
  /** Controlled HTML value. */
  value?: string;
  /** Uncontrolled initial HTML value. */
  defaultValue?: string;
  placeholder?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  /** Called with the document's HTML whenever it changes. */
  onChange?: (html: string) => void;
}

/**
 * Creates the tiptap editor and keeps it in step with the props that can change
 * after it exists.
 *
 * `immediatelyRender: false` means the editor is created on mount rather than
 * during render, so the component can be server-rendered — the price is that
 * the editor is `null` for the first client render, which the component handles
 * by holding the field's shape until it arrives.
 */
export const useRichTextEditor = ({
  attributes,
  value,
  defaultValue,
  placeholder,
  isDisabled,
  isReadOnly,
  onChange,
}: UseRichTextEditorOptions): Editor | null => {
  // tiptap binds its handlers and its placeholder getter once, at creation, so
  // both read the latest props through refs instead of stale closures.
  const onChangeRef = useRef(onChange);
  const placeholderRef = useRef(placeholder);

  useEffect(() => {
    onChangeRef.current = onChange;
    placeholderRef.current = placeholder;
  }, [onChange, placeholder]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: buildExtensions(() => placeholderRef.current ?? ""),
    content: value ?? defaultValue ?? "",
    editable: !(isDisabled || isReadOnly),
    editorProps: { attributes },
    onUpdate: ({ editor: updated }) => {
      onChangeRef.current?.(updated.getHTML());
    },
  });

  // Attributes carry the validation and description wiring, which changes as
  // the field is validated. `setOptions` updates a live editor in place.
  useEffect(() => {
    editor?.setOptions({ editorProps: { attributes } });
  }, [editor, attributes]);

  useEffect(() => {
    editor?.setEditable(!(isDisabled || isReadOnly), false);
  }, [editor, isDisabled, isReadOnly]);

  // Controlled mode. Writing back only when the HTML genuinely differs keeps
  // the caret where the user left it — an unconditional setContent would reset
  // the selection on every keystroke that round-trips through consumer state.
  useEffect(() => {
    if (!editor || value === undefined || editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  return editor;
};
