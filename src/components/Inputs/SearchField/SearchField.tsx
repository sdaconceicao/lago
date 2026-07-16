"use client";
import clsx from "clsx";
import { Search, X } from "lucide-react";
import {
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
  Button,
  Input,
  type ValidationResult,
} from "react-aria-components/SearchField";
import {
  Description,
  FieldError,
  Label,
} from "@/components/Inputs/FormComponents/index";
import textFieldStyles from "@/components/Inputs/TextField/TextField.module.css";
import utils from "@/styles/utilities.module.css";
import styles from "./SearchField.module.css";

export interface SearchFieldProps extends AriaSearchFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
}

export function SearchField({
  label,
  description,
  errorMessage,
  placeholder,
  ...props
}: SearchFieldProps) {
  return (
    <AriaSearchField
      {...props}
      className={clsx(
        "react-aria-SearchField",
        styles.searchField,
        props.className
      )}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      <Search size={18} />
      <Input
        placeholder={placeholder}
        className={clsx("react-aria-Input", textFieldStyles.input, utils.inset)}
      />
      <Button className={clsx("clear-button", styles.clearButton)}>
        <X size={14} />
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaSearchField>
  );
}
