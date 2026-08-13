"use client";
import clsx from "clsx";
import { Search, X } from "lucide-react";
import type React from "react";
import { useCallback, useRef } from "react";
import { Group } from "react-aria-components/Group";
import {
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
  Input,
  type ValidationResult,
} from "react-aria-components/SearchField";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldButton,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import textFieldStyles from "@/components/Inputs/TextField/TextField.module.css";
import base from "@/styles/base.module.css";
import { useSearchSuggestions } from "./SearchField.hooks";
import styles from "./SearchField.module.css";
import { DEFAULT_DEBOUNCE_DELAY } from "./SearchField.utils";

export interface SearchFieldProps extends AriaSearchFieldProps {
  /** Accessible label rendered above the field. */
  label?: string;
  /** Helper text rendered below the field. */
  description?: string;
  /** Error message shown when the field is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Placeholder text shown while the field is empty. */
  placeholder?: string;
  /** Called with the query after the user stops typing for `debounceDelay` milliseconds. */
  onSearch?: (value: string) => void;
  /** Milliseconds to wait after the last keystroke before `onSearch` fires. Defaults to 300. */
  debounceDelay?: number;
  /** Ref to the inset field group. Used by SearchFieldWithSuggestions to anchor its dropdown. */
  groupRef?: React.Ref<HTMLDivElement>;
  /** Capture-phase key handler on the field group. Used by SearchFieldWithSuggestions to arbitrate Enter/Escape before the field's own handlers. */
  onKeyDownCapture?: React.KeyboardEventHandler<HTMLDivElement>;
  /** Field size: 28px, 36px (default), or 48px tall. */
  size?: FieldSize;
}

// The dropdown-less search field. Built on the react-aria SearchField
export function SearchField({
  label,
  description,
  errorMessage,
  placeholder,
  onChange,
  onSubmit,
  onSearch,
  debounceDelay = DEFAULT_DEBOUNCE_DELAY,
  groupRef,
  onKeyDownCapture,
  size = DEFAULT_FIELD_SIZE,
  ...props
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { search } = useSearchSuggestions({ onSearch, debounceDelay });

  const handleChange = useCallback(
    (value: string) => {
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
      data-field-size={size}
      onChange={handleChange}
      onSubmit={onSubmit}
      className={clsx(
        "react-aria-SearchField",
        styles.searchField,
        props.className
      )}
    >
      {({ isEmpty }) => (
        <>
          {label && <Label isRequired={props.isRequired}>{label}</Label>}
          <Group
            ref={groupRef}
            onKeyDownCapture={onKeyDownCapture}
            isDisabled={props.isDisabled}
            isInvalid={props.isInvalid}
            className={clsx(
              "react-aria-Group",
              textFieldStyles.field,
              base.inset
            )}
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
            {!isEmpty && (
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
        </>
      )}
    </AriaSearchField>
  );
}
