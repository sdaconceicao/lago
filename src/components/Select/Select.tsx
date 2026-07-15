"use client";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import {
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  Input,
  type ListBoxItemProps,
  type ListBoxProps,
  type ValidationResult,
} from "react-aria-components/ComboBox";
import { Group } from "react-aria-components/Group";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { Text } from "../Content/Content";
import { Description, FieldButton, FieldError, Label } from "../Form/Form";
import { DropdownListBox, ListBoxItem } from "../ListBox/ListBox";
import { Popover } from "../Popover/Popover";
import utils from "../../styles/utilities.module.css";
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
      {label && <Label>{label}</Label>}
      {/* Field, input, and chevron mirror the MultiSelect so the two align. */}
      <Group className={clsx("react-aria-Group", styles.field, utils.inset)}>
        <Input
          className={clsx("react-aria-Input", styles.input)}
          placeholder={placeholder}
        />
        <FieldButton>
          <ChevronDown />
        </FieldButton>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow className={styles.selectPopover}>
        <SelectListBox renderEmptyState={() => "No results found."}>
          {children}
        </SelectListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function SelectListBox<T>(props: ListBoxProps<T>) {
  return <DropdownListBox {...props} />;
}

export function SelectItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue ||
    (typeof props.children === "string" ? props.children : undefined);
  return (
    <ListBoxItem
      {...props}
      textValue={textValue}
      className={clsx("select-item", styles.item)}
    >
      {composeRenderProps(props.children, (children, { isSelected }) => (
        <>
          {typeof children === "string" ? (
            <Text slot="label">{children}</Text>
          ) : (
            children
          )}
          {isSelected && (
            <Check aria-hidden="true" className={styles.checkIcon} />
          )}
        </>
      ))}
    </ListBoxItem>
  );
}
