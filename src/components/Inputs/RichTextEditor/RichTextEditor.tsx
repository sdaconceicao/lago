"use client";
import { EditorContent } from "@tiptap/react";
import clsx from "clsx";
import { useCallback, useId, useMemo, useState } from "react";
import { FieldErrorContext } from "react-aria-components/FieldError";
import type { ValidationResult } from "react-aria-components/TextField";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import base from "@/styles/base.module.css";
import { useRichTextEditor } from "./RichTextEditor.hooks";
import styles from "./RichTextEditor.module.css";
import type { RichTextEditorToolbar as RichTextEditorToolbarLayout } from "./RichTextEditor.types";
import {
  buildEditorAttributes,
  buildValidation,
  DEFAULT_TOOLBAR,
  joinIds,
  normalizeToolbar,
} from "./RichTextEditor.utils";
import { RichTextEditorToolbar } from "./Toolbar/RichTextEditorToolbar";

export interface RichTextEditorProps {
  /** Accessible label rendered above the field. */
  label?: string;
  /** Helper text rendered below the field. */
  description?: string;
  /** Error message shown when the field is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Text shown while the document is empty. */
  placeholder?: string;
  /** Controlled document HTML. Pair with `onChange`. */
  value?: string;
  /** Initial document HTML when uncontrolled. */
  defaultValue?: string;
  /** Called with the document's HTML whenever it changes. */
  onChange?: (html: string) => void;
  /** Name of the hidden input carrying the HTML in a native form submission. */
  name?: string;
  /** Marks the field required and appends an asterisk to the label. */
  isRequired?: boolean;
  /** Shows the invalid styling and renders `errorMessage`. */
  isInvalid?: boolean;
  /** Disables the field: the content cannot be edited or focused. */
  isDisabled?: boolean;
  /** Allows focus and selection but not editing. */
  isReadOnly?: boolean;
  /** Field size: 28px, 36px (default), or 48px toolbar buttons and matching text. */
  size?: FieldSize;
  /**
   * The toolbar layout, as ordered groups of tools. Each group renders as one
   * segmented button track with a separator between groups.
   *
   * Because the array is ordered and explicit it sets which tools appear as well
   * as their order — omit a tool to hide its button. Formatting itself is not
   * removed: the keyboard shortcut still works and pasted marks still render.
   *
   * @default DEFAULT_TOOLBAR
   */
  toolbar?: RichTextEditorToolbarLayout;
  /** CSS class applied to the outermost element. */
  className?: string;
}

/**
 * A rich text editor for formatted prose, built on tiptap with lago's own
 * toolbar, field shell, label, help text and validation.
 *
 * tiptap edits a `contenteditable`, not an `input`, so this field cannot be a
 * react-aria `TextField` the way `TextArea` is. The label, description and
 * error wiring are therefore stated on the editable element directly, and the
 * validation context `FieldError` reads is supplied here — which keeps the
 * accessible name and description on the element that actually takes the
 * typing, rather than on a hidden input standing in for it.
 *
 * Set `name` to submit the document with a surrounding form; the HTML is
 * carried by a hidden input.
 */
export function RichTextEditor({
  label,
  description,
  errorMessage,
  placeholder,
  value,
  defaultValue,
  onChange,
  name,
  isRequired,
  isInvalid,
  isDisabled,
  isReadOnly,
  size = DEFAULT_FIELD_SIZE,
  toolbar = DEFAULT_TOOLBAR,
  className,
}: RichTextEditorProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const groups = useMemo(() => normalizeToolbar(toolbar), [toolbar]);

  const describedBy = joinIds(
    description && descriptionId,
    isInvalid && errorId
  );

  const attributes = useMemo(
    () =>
      buildEditorAttributes({
        className: styles.content,
        labelId: label ? labelId : undefined,
        describedBy,
        isInvalid,
        isRequired,
        isReadOnly,
      }),
    [label, labelId, describedBy, isInvalid, isRequired, isReadOnly]
  );

  const validation = useMemo(
    () => buildValidation(isInvalid, errorMessage),
    [isInvalid, errorMessage]
  );

  // Only tracked when there is a hidden input to fill, so an editor without a
  // `name` does not re-render this shell on every keystroke.
  const [submitValue, setSubmitValue] = useState(value ?? defaultValue ?? "");

  const handleChange = useCallback(
    (html: string) => {
      if (name !== undefined) setSubmitValue(html);
      onChange?.(html);
    },
    [name, onChange]
  );

  const editor = useRichTextEditor({
    attributes,
    value,
    defaultValue,
    placeholder,
    isDisabled,
    isReadOnly,
    onChange: handleChange,
  });

  return (
    <div
      className={clsx(styles.richTextEditor, className)}
      data-field-size={size}
    >
      {label && (
        <Label
          id={labelId}
          isRequired={isRequired}
          // A `contenteditable` is not a labelable element, so `for` cannot
          // reach it and a click would otherwise do nothing. `aria-labelledby`
          // on the editable element does the naming; this restores the gesture.
          onClick={() => editor?.commands.focus()}
        >
          {label}
        </Label>
      )}

      <div
        className={clsx(styles.field, base.inset)}
        data-invalid={isInvalid || undefined}
        data-disabled={isDisabled || undefined}
      >
        {editor && groups.length > 0 && (
          <RichTextEditorToolbar
            editor={editor}
            toolbar={groups}
            size={size}
            isDisabled={isDisabled || isReadOnly}
          />
        )}
        <EditorContent editor={editor} className={styles.contentWrapper} />
      </div>

      {description && (
        <Description id={descriptionId}>{description}</Description>
      )}

      {/* FieldError reads its validation from context, which normally comes from
          a react-aria field wrapping a native input. There is none here, so the
          editor supplies it — that is what lets this field reuse the same error
          element, and the same styling, as every other input in the library. */}
      <FieldErrorContext.Provider value={validation}>
        <FieldError id={errorId}>{errorMessage}</FieldError>
      </FieldErrorContext.Provider>

      {name !== undefined && (
        <input type="hidden" name={name} value={value ?? submitValue} />
      )}
    </div>
  );
}
