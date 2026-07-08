"use client";
import { Search, X } from "lucide-react";
import {
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
  Button,
  Input,
  type ValidationResult,
} from "react-aria-components/SearchField";
import { Description, FieldError, Label } from "../Form/Form";
import "./SearchField.css";

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
    <AriaSearchField {...props}>
      {label && <Label>{label}</Label>}
      <Search size={18} />
      <Input placeholder={placeholder} className="react-aria-Input inset" />
      <Button className="clear-button">
        <X size={14} />
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaSearchField>
  );
}
