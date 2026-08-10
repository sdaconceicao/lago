"use client";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useMemo, useRef } from "react";
import {
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  ComboBoxValue,
  type ValidationResult,
} from "react-aria-components/ComboBox";
import { Group } from "react-aria-components/Group";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldButton,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import { Popover } from "@/components/Overlays/Popover/Popover";
import utils from "@/styles/utilities.module.css";
import { MultiSelectInput } from "./BaseComponents/MultiSelectInput";
import { MultiSelectListBox } from "./BaseComponents/MultiSelectListBox";
import { MultiSelectTags } from "./BaseComponents/MultiSelectTags";
import {
  MultiSelectToolbar,
  type MultiSelectToolbarBridge,
  MultiSelectToolbarContext,
} from "./BaseComponents/MultiSelectToolbar";
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
   * and the tag chips. At `"sm"` and `"md"` the tags scroll rather than wrap,
   * so the field holds its height; at `"lg"` they wrap and it grows.
   */
  size?: FieldSize;
  /**
   * Adds "select all" and "select none" controls to the dropdown, as a toolbar
   * of buttons pinned above the options. ArrowUp from the search input (while
   * focus is not deeper in the list) moves to them; ArrowDown from a control
   * returns to the input. Tab reaches them as well. They act on the options
   * currently on offer — with a filter typed that is the matches shown, leaving
   * the rest of the selection untouched — and never select a disabled option.
   * A control that would change nothing is disabled. Defaults to `false`.
   */
  allowsSelectAll?: boolean;
  /** Label for the control that checks every option on offer. Defaults to "Select all". */
  selectAllLabel?: string;
  /** Label for the control that unchecks every option on offer. Defaults to "Select none". */
  selectNoneLabel?: string;
}

/**
 * A multi-select combobox. Typing in the input filters the list, options
 * toggle with checkboxes and stay visible while the menu remains open, and
 * selected items render as removable tags or comma-separated text. Backspace
 * in an empty input removes the most recently selected item. `allowsSelectAll`
 * adds "select all" and "select none" controls above the options.
 */
export function MultiSelect<T>({
  label,
  description,
  errorMessage,
  children,
  placeholder,
  displayMode = "tags",
  size = DEFAULT_FIELD_SIZE,
  allowsSelectAll = false,
  selectAllLabel = "Select all",
  selectNoneLabel = "Select none",
  ...props
}: MultiSelectProps<T>) {
  // The toolbar lives in the portaled popover; these refs let the input and
  // toolbar hand focus to each other on ArrowUp / ArrowDown. Null while the
  // toolbar is off, so the input leaves arrow keys to react-aria.
  const toolbarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const bridge = useMemo<MultiSelectToolbarBridge>(
    () => ({ toolbarRef, searchInputRef }),
    []
  );

  return (
    <MultiSelectToolbarContext.Provider value={allowsSelectAll ? bridge : null}>
      <AriaComboBox
        menuTrigger="focus"
        allowsEmptyCollection
        {...props}
        selectionMode="multiple"
        data-field-size={size}
        className={clsx("react-aria-ComboBox", styles.multiSelect)}
      >
        {label && <Label isRequired={props.isRequired}>{label}</Label>}
        {/* The Group is wired up by the ComboBox: the popover is positioned
            against it and it gets data-hovered/focus/disabled/invalid states. */}
        <Group className={clsx("react-aria-Group", styles.field, utils.inset)}>
          {displayMode === "tags" ? (
            <MultiSelectTags />
          ) : (
            <ComboBoxValue
              className={clsx("react-aria-ComboBoxValue", styles.textValue)}
            >
              {({ state }) =>
                state.selectedItems.map((item) => item.textValue).join(", ")
              }
            </ComboBoxValue>
          )}
          <MultiSelectInput ref={searchInputRef} placeholder={placeholder} />
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
          {/* Inside the popover but outside the listbox: the controls act on
              the collection, they are not part of it. */}
          {allowsSelectAll && (
            <MultiSelectToolbar
              size={size}
              selectAllLabel={selectAllLabel}
              selectNoneLabel={selectNoneLabel}
            />
          )}
          <MultiSelectListBox>{children}</MultiSelectListBox>
        </Popover>
      </AriaComboBox>
    </MultiSelectToolbarContext.Provider>
  );
}

export { MultiSelectItem } from "@/components/Inputs/MultiSelect/BaseComponents/MultiSelectItem";
export { MultiSelectTags } from "@/components/Inputs/MultiSelect/BaseComponents/MultiSelectTags";
export type { MultiSelectInputProps } from "./BaseComponents/MultiSelectInput";
export { MultiSelectInput } from "./BaseComponents/MultiSelectInput";
