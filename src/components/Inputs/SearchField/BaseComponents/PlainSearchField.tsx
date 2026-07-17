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

/**
 * The dropdown-less search field. Built on the react-aria SearchField so the
 * input keeps the searchbox role, Enter submits, Escape clears, and it wires
 * up when nested in an Autocomplete (e.g. the CommandPalette).
 */
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

  // Whether the field currently holds text. Drives the clear button so it
  // renders only when there is something to clear, in every browser (rather
  // than leaning on a CSS [data-empty] rule).
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
      {/* The Group is the inset field surface shared by the input and trailing
          buttons, mirroring the TextField, Select, and DatePicker fields. */}
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
        {/* Rendered only while the field has text. With no slot override it is
            the SearchField's context-wired clear button, clearing on press. */}
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
