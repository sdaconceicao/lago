"use client";
import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { Search, X } from "lucide-react";
import { Group } from "react-aria-components/Group";
import {
  SearchField as AriaSearchField,
  Input,
} from "react-aria-components/SearchField";
import {
  Description,
  FieldButton,
  FieldError,
  Label,
} from "@/components/Inputs/FormComponents/index";
import textFieldStyles from "@/components/Inputs/TextField/TextField.module.css";
import utils from "@/styles/utilities.module.css";
import { useSearchSuggestions } from "../SearchField.hooks";
import type { SearchFieldProps } from "../SearchField.types";
import { DEFAULT_DEBOUNCE_DELAY } from "../SearchField.utils";
import styles from "../SearchField.module.css";

// The dropdown-less search field. Built on the react-aria SearchField
export function PlainSearchField({
  label,
  description,
  errorMessage,
  placeholder,
  onChange,
  onSubmit,
  onSearch,
  debounceDelay = DEFAULT_DEBOUNCE_DELAY,
  suggestions: _suggestions,
  loadSuggestions: _loadSuggestions,
  onSuggestionSelect: _onSuggestionSelect,
  ...props
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { search } = useSearchSuggestions({ onSearch, debounceDelay });

  // Used to avoid showing the clear button when the field is empty, fixing a bug that arose from relying on a CSS [data-empty] rule.
  const [uncontrolledHasText, setUncontrolledHasText] = useState(
    Boolean(props.defaultValue)
  );
  const hasText =
    props.value !== undefined ? props.value !== "" : uncontrolledHasText;

  const handleChange = useCallback(
    (value: string) => {
      setUncontrolledHasText(value !== "");
      onChange?.(value);
      search(value);
    },
    [onChange, search]
  );

  const handleSubmitPress = useCallback(() => {
    onSubmit?.(inputRef.current?.value ?? "");
  }, [onSubmit]);

  return (
    <AriaSearchField
      {...props}
      onChange={handleChange}
      onSubmit={onSubmit}
      className={clsx(
        "react-aria-SearchField",
        styles.searchField,
        props.className
      )}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      <Group
        isDisabled={props.isDisabled}
        isInvalid={props.isInvalid}
        className={clsx("react-aria-Group", textFieldStyles.field, utils.inset)}
      >
        <Input
          ref={inputRef}
          placeholder={placeholder}
          className={clsx(
            "react-aria-Input",
            textFieldStyles.fieldInput,
            styles.input
          )}
        />
        {hasText && (
          <FieldButton aria-label="Clear search">
            <X />
          </FieldButton>
        )}
        <FieldButton
          slot={null}
          aria-label="Search"
          isDisabled={props.isDisabled}
          onPress={handleSubmitPress}
        >
          <Search />
        </FieldButton>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaSearchField>
  );
}
