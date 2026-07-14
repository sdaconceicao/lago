"use client";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import {
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  ComboBoxValue,
  Input,
  type ListBoxItemProps,
  type ListBoxProps,
  type ValidationResult,
} from "react-aria-components/ComboBox";
import { Description, FieldButton, FieldError, Label } from "../Form/Form";
import { DropdownItem, DropdownListBox } from "../ListBox/ListBox";
import { Popover } from "../Popover/Popover";
import utils from "../../styles/utilities.module.css";
import textFieldStyles from "../TextField/TextField.module.css";
import styles from "./ComboBox.module.css";

export interface ComboBoxProps<T, M extends "single" | "multiple"> extends Omit<
  AriaComboBoxProps<T, M>,
  "children"
> {
  label?: string;
  description?: string | null;
  errorMessage?: string | ((validation: ValidationResult) => string);
  children: React.ReactNode | ((item: T) => React.ReactNode);
  placeholder?: string;
}

export function ComboBox<T, M extends "single" | "multiple" = "single">({
  label,
  description,
  errorMessage,
  children,
  placeholder,
  ...props
}: ComboBoxProps<T, M>) {
  return (
    <AriaComboBox
      {...props}
      className={clsx("react-aria-ComboBox", styles.comboBox)}
    >
      {label && <Label>{label}</Label>}
      <div className={clsx(styles.comboboxField)}>
        <Input
          className={clsx(
            "react-aria-Input",
            textFieldStyles.input,
            utils.inset
          )}
          placeholder={placeholder}
        />
        <FieldButton>
          <ChevronDown />
        </FieldButton>
      </div>
      {props.selectionMode === "multiple" && (
        <ComboBoxValue placeholder="No items selected" />
      )}
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow className={styles.comboboxPopover}>
        <ComboBoxListBox>{children}</ComboBoxListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function ComboBoxListBox<T>(props: ListBoxProps<T>) {
  return <DropdownListBox {...props} />;
}

export function ComboBoxItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}
