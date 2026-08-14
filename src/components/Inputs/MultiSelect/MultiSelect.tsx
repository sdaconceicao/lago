"use client";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import {
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  ComboBoxValue,
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
import { MultiSelectInput } from "./BaseComponents/MultiSelectInput/MultiSelectInput";
import { MultiSelectTags } from "./BaseComponents/MultiSelectTags/MultiSelectTags";
import styles from "./MultiSelect.module.css";

/** Controls how selected items are displayed inside the field. */
export type MultiSelectDisplayMode = "tags" | "text";

export interface MultiSelectProps<T>
  extends Omit<AriaComboBoxProps<T, "multiple">, "children" | "selectionMode"> {
  /** Accessible label rendered above the field. */
  label?: string;
  /** Helper text rendered below the field. Provides additional context or instructions. */
  description?: string | null;
  /** Error message shown when the field is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** The list options: static nodes or a render function for each item (e.g. (item) => <MultiSelectItem>{item.name}</MultiSelectItem>). */
  children: React.ReactNode | ((item: T) => React.ReactNode);
  /** Placeholder text for the search input. Shown only while no items are selected. */
  placeholder?: string;
  /** How selected items are displayed: "tags" (default) shows removable tag chips, "text" shows a comma-separated list. Defaults to "tags". */
  displayMode?: MultiSelectDisplayMode;
  /**
   * Field size: 28px, 36px (default), or 48px tall. Also scales the dropdown
   * and the tag chips. At `"sm"` and `"md"` the field is a single row that
   * holds its height: the tags that fit are shown and the rest collapse into a
   * "+N" counter. At `"lg"` every tag is shown, wrapping as the field grows.
   */
  size?: FieldSize;
}

/**
 * A multi-select combobox. Typing in the input filters the list, options
 * toggle with checkboxes and stay visible while the menu remains open, and
 * selected items render as removable tags or comma-separated text. Backspace
 * in an empty input removes the most recently selected item.
 *
 * At `sm` and `md` the tags that do not fit the row collapse into a "+N"
 * counter, so the field stays one row tall and readable however narrow the
 * column is and however long the labels are.
 */
export function MultiSelect<T>({
  label,
  description,
  errorMessage,
  children,
  placeholder,
  displayMode = "tags",
  size = DEFAULT_FIELD_SIZE,
  ...props
}: MultiSelectProps<T>) {
  return (
    <AriaComboBox
      menuTrigger="focus"
      allowsEmptyCollection
      {...props}
      selectionMode="multiple"
      data-field-size={size}
      className={clsx(
        "react-aria-ComboBox",
        styles.multiSelect,
        props.className
      )}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      {/* The Group is wired up by the ComboBox: the popover is positioned
          against it and it gets data-hovered/focus/disabled/invalid states. */}
      <Group className={clsx("react-aria-Group", styles.field, base.inset)}>
        {displayMode === "tags" ? (
          <MultiSelectTags size={size} />
        ) : (
          <ComboBoxValue
            className={clsx("react-aria-ComboBoxValue", styles.textValue)}
          >
            {({ state }) =>
              state.selectedItems.map((item) => item.textValue).join(", ")
            }
          </ComboBoxValue>
        )}
        <MultiSelectInput placeholder={placeholder} />
        <FieldButton>
          <ChevronDown />
        </FieldButton>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      {/* The popover is portaled to the document body, so it cannot inherit
          the --field-* scope from the field: carry the size across explicitly. */}
      <Popover
        hideArrow
        data-field-size={size}
        className={styles.multiSelectPopover}
      >
        <DropdownListBox renderEmptyState={() => "No results found."}>
          {children}
        </DropdownListBox>
      </Popover>
    </AriaComboBox>
  );
}

export { MultiSelectItem } from "@/components/Inputs/MultiSelect/BaseComponents/MultiSelectItem/MultiSelectItem";
export { MultiSelectTags } from "@/components/Inputs/MultiSelect/BaseComponents/MultiSelectTags/MultiSelectTags";
export type { MultiSelectInputProps } from "./BaseComponents/MultiSelectInput/MultiSelectInput";
export { MultiSelectInput } from "./BaseComponents/MultiSelectInput/MultiSelectInput";
