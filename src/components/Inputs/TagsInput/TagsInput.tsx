"use client";
import clsx from "clsx";
import { Search } from "lucide-react";
import {
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  type ValidationResult,
} from "react-aria-components/ComboBox";
import { Group } from "react-aria-components/Group";
import { DropdownListBox } from "@/components/Collections/ListBox/ListBox";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldButton,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import { Popover } from "@/components/Overlays/Popover/Popover";
import base from "@/styles/base.module.css";
import { TagsInputOption } from "./BaseComponents/TagsInputOption";
import { TagsInputQuery } from "./BaseComponents/TagsInputQuery";
import { TagsInputTags } from "./BaseComponents/TagsInputTags";
import { useTagsInputState } from "./TagsInput.hooks";
import styles from "./TagsInput.module.css";
import type { TagsInputItem } from "./TagsInput.utils";

export interface TagsInputProps
  extends Omit<
    AriaComboBoxProps<TagsInputItem, "multiple">,
    // The TagsInput owns its collection and selection so it can mint items the
    // list does not hold, and it is always a multi-select.
    | "children"
    | "selectionMode"
    | "items"
    | "defaultItems"
    | "inputValue"
    | "defaultInputValue"
    | "allowsCustomValue"
    | "allowsEmptyCollection"
  > {
  /** Accessible label rendered above the field. */
  label?: string;
  /** Helper text rendered below the tags. Provides additional context or instructions. */
  description?: string | null;
  /** Error message shown when the field is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** The options offered in the dropdown, filtered as the user types. */
  items?: TagsInputItem[];
  /** Placeholder text for the input. Stays visible while tags are selected, since the tags sit below the field. */
  placeholder?: string;
  /**
   * Whether text that matches no option can be added as a tag of its own. Adds
   * an "Add …" row to the dropdown, and makes Enter on an unmatched query
   * create the tag. The new tag's key is its text. Defaults to false.
   */
  allowsCreate?: boolean;
  /** Called with each tag the user creates, for callers that persist new options. */
  onCreate?: (item: TagsInputItem) => void;
  /** The shape of the tag chips: "round" (default) renders pills, "default" matches the input border radius. */
  tagVariant?: "default" | "round";
  /** Text shown in the dropdown when the query matches no option. Defaults to "No results found.". */
  emptyState?: string;
  /**
   * Field size: 28px, 36px (default), or 48px tall. Also scales the dropdown and
   * the tag chips. The field itself holds one line at every size — the tags are
   * below it, so they wrap and grow without changing the field's height.
   */
  size?: FieldSize;
}

/**
 * A tag input. Typing filters an autocomplete list, picking an option adds it as
 * a removable chip below the field, and — with `allowsCreate` — text that
 * matches nothing can be added as a tag of its own. Enter adds the highlighted
 * option or, failing that, whatever has been typed; Backspace in an empty input
 * drops the last tag.
 */
export function TagsInput({
  label,
  description,
  errorMessage,
  items = [],
  placeholder,
  allowsCreate = false,
  onCreate,
  tagVariant = "round",
  emptyState = "No results found.",
  size = DEFAULT_FIELD_SIZE,
  value,
  defaultValue,
  onChange,
  onInputChange,
  ...props
}: TagsInputProps) {
  const {
    selectedKeys,
    collectionItems,
    handleChange,
    handleInputChange,
    addQuery,
  } = useTagsInputState({
    items,
    value,
    defaultValue,
    onChange,
    allowsCreate,
    onCreate,
    onInputChange,
  });

  return (
    <AriaComboBox<TagsInputItem, "multiple">
      menuTrigger="focus"
      allowsEmptyCollection
      {...props}
      selectionMode="multiple"
      defaultItems={collectionItems}
      value={selectedKeys}
      onChange={handleChange}
      onInputChange={handleInputChange}
      data-field-size={size}
      className={clsx("react-aria-ComboBox", styles.tagsInput, props.className)}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      {/* The Group is wired up by the ComboBox: the popover is positioned
          against it and it gets data-hovered/focus/disabled/invalid states.
          Only the input and the toggle live in it, so the field keeps its
          height however many tags are selected. */}
      <Group className={clsx("react-aria-Group", styles.field, base.inset)}>
        <TagsInputQuery placeholder={placeholder} onAddQuery={addQuery} />
        <FieldButton>
          <Search />
        </FieldButton>
      </Group>
      {/* A read-only field's tags are not removable either: the chips are the
          field's value, so the remove buttons have to follow the same rules the
          input does. */}
      <TagsInputTags
        variant={tagVariant}
        isDisabled={props.isDisabled || props.isReadOnly}
      />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      {/* The popover is portaled to the document body, so it cannot inherit the
          --field-* scope from the field: carry the size across explicitly. */}
      <Popover
        hideArrow
        data-field-size={size}
        className={styles.tagsInputPopover}
      >
        <DropdownListBox<TagsInputItem> renderEmptyState={() => emptyState}>
          {(item) => <TagsInputOption item={item} />}
        </DropdownListBox>
      </Popover>
    </AriaComboBox>
  );
}

export type { TagsInputQueryProps } from "./BaseComponents/TagsInputQuery";
export { TagsInputQuery } from "./BaseComponents/TagsInputQuery";
export type { TagsInputTagsProps } from "./BaseComponents/TagsInputTags";
export { TagsInputTags } from "./BaseComponents/TagsInputTags";
export type { TagsInputItem } from "./TagsInput.utils";
