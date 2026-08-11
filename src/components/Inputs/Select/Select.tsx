"use client";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
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
import { SelectInput } from "./BaseComponents/SelectInput";
import styles from "./Select.module.css";

export interface SelectProps<T> extends Omit<AriaComboBoxProps<T>, "children"> {
  /** Accessible label rendered above the field. */
  label?: string;
  /** Helper text rendered below the field. */
  description?: string;
  /** Error message shown when the field is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Placeholder text for the search input. Shown only while nothing is selected. */
  placeholder?: string;
  /** Options available in the dropdown. */
  items?: Iterable<T>;
  /** The list options: static nodes or a render function for each item. */
  children: React.ReactNode | ((item: T) => React.ReactNode);
  /** Field size: 28px, 36px (default), or 48px tall. Also scales the dropdown. */
  size?: FieldSize;
}

/**
 * A single-select combobox. Typing in the field filters the list, and the
 * chosen option fills the field. Matches the MultiSelect styling.
 */
export function Select<T extends object>({
  label,
  description,
  errorMessage,
  children,
  items,
  placeholder = "Select an item",
  size = DEFAULT_FIELD_SIZE,
  ...props
}: SelectProps<T>) {
  return (
    <AriaComboBox
      menuTrigger="focus"
      allowsEmptyCollection
      {...props}
      items={items}
      data-field-size={size}
      className={clsx("react-aria-ComboBox", styles.select)}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      {/* Field, input, and chevron mirror the MultiSelect so the two align. */}
      <Group className={clsx("react-aria-Group", styles.field, base.inset)}>
        <SelectInput placeholder={placeholder} />
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
        className={styles.selectPopover}
      >
        <DropdownListBox renderEmptyState={() => "No results found."}>
          {children}
        </DropdownListBox>
      </Popover>
    </AriaComboBox>
  );
}

export { SelectItem } from "@/components/Inputs/Select/BaseComponents/SelectItem";
export type { SelectInputProps } from "./BaseComponents/SelectInput";
export { SelectInput } from "./BaseComponents/SelectInput";
