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
  Description,
  FieldButton,
  FieldError,
  Label,
} from "@/components/Inputs/FormComponents/index";
import { Popover } from "@/components/Overlays/Popover/Popover";
import utils from "@/styles/utilities.module.css";
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
  ...props
}: SelectProps<T>) {
  return (
    <AriaComboBox
      menuTrigger="focus"
      allowsEmptyCollection
      {...props}
      items={items}
      className={clsx("react-aria-ComboBox", styles.select)}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      {/* Field, input, and chevron mirror the MultiSelect so the two align. */}
      <Group className={clsx("react-aria-Group", styles.field, utils.inset)}>
        <SelectInput placeholder={placeholder} />
        <FieldButton>
          <ChevronDown />
        </FieldButton>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow className={styles.selectPopover}>
        <DropdownListBox renderEmptyState={() => "No results found."}>
          {children}
        </DropdownListBox>
      </Popover>
    </AriaComboBox>
  );
}

export { SelectInput } from "./BaseComponents/SelectInput";
export type { SelectInputProps } from "./BaseComponents/SelectInput";
export { SelectItem } from "@/components/Inputs/Select/BaseComponents/SelectItem";
