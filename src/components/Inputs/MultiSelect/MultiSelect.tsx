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
import { ListBox } from "../../ListBox/ListBox";
import { Popover } from "../../Popover/Popover";
import { Description, FieldButton, FieldError, Label } from "../Form/Form";
import { MultiSelectInput } from "./BaseComponents/MultiSelectInput";
import { MultiSelectTags } from "./BaseComponents/MultiSelectTags";
import utils from "../../styles/utilities.module.css";
import styles from "./MultiSelect.module.css";

/** Controls how selected items are displayed inside the field. */
export type MultiSelectDisplayMode = "tags" | "text";

export interface MultiSelectProps<T> extends Omit<
  AriaComboBoxProps<T, "multiple">,
  "children" | "selectionMode"
> {
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
}

/**
 * A multi-select combobox. Typing in the input filters the list, options
 * toggle with checkboxes and stay visible while the menu remains open, and
 * selected items render as removable tags or comma-separated text. Backspace
 * in an empty input removes the most recently selected item.
 */
export function MultiSelect<T>({
  label,
  description,
  errorMessage,
  children,
  placeholder,
  displayMode = "tags",
  ...props
}: MultiSelectProps<T>) {
  return (
    <AriaComboBox
      menuTrigger="focus"
      allowsEmptyCollection
      {...props}
      selectionMode="multiple"
      className={clsx("react-aria-ComboBox", styles.multiSelect)}
    >
      {label && <Label>{label}</Label>}
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
        <MultiSelectInput placeholder={placeholder} />
        <FieldButton>
          <ChevronDown />
        </FieldButton>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow className={styles.multiSelectPopover}>
        <ListBox renderEmptyState={() => "No results found."}>
          {children}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}

export { MultiSelectInput } from "./BaseComponents/MultiSelectInput";
export type { MultiSelectInputProps } from "./BaseComponents/MultiSelectInput";
export { MultiSelectItem } from "./BaseComponents/MultiSelectItem";
export { MultiSelectTags } from "./BaseComponents/MultiSelectTags";
