import type { ValidationResult } from "react-aria-components/TextField";
import type { RichTextEditorToolbar } from "./RichTextEditor.types";

/**
 * The toolbar a RichTextEditor renders when no `toolbar` prop is given: the
 * formatting a writer expects to find in a text editor, grouped so that related
 * controls sit in one segmented track.
 */
export const DEFAULT_TOOLBAR: RichTextEditorToolbar = [
  ["undo", "redo"],
  ["heading1", "heading2", "heading3"],
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
 * `ToggleButtonGroup` or a `Separator` with nothing on one side of it.
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
  /** Id of the rendered `Label`, if there is one. */
  labelId?: string;
  /** Ids of the description and error message, if rendered. */
  describedBy?: string;
  isInvalid?: boolean;
  isRequired?: boolean;
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
  describedBy,
  isInvalid,
  isRequired,
  isReadOnly,
}: EditorAttributesOptions): Record<string, string> => {
  const attributes: Record<string, string> = {
    class: className,
    role: "textbox",
    "aria-multiline": "true",
  };

  if (labelId) attributes["aria-labelledby"] = labelId;
  if (describedBy) attributes["aria-describedby"] = describedBy;
  if (isInvalid) attributes["aria-invalid"] = "true";
  if (isRequired) attributes["aria-required"] = "true";
  if (isReadOnly) attributes["aria-readonly"] = "true";

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
