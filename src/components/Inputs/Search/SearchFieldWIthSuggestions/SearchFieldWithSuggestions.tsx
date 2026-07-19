"use client";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Autocomplete as AriaAutocomplete } from "react-aria-components/Autocomplete";
import type { Key } from "react-aria-components/ListBox";
import {
  DropdownItem,
  DropdownListBox,
} from "@/components/Collections/ListBox/ListBox";
import { Popover } from "@/components/Overlays/Popover/Popover";
import { SearchField, type SearchFieldProps } from "../SearchField/SearchField";
import { useSearchSuggestions } from "../SearchField/SearchField.hooks";
import {
  DEFAULT_DEBOUNCE_DELAY,
  type SearchSuggestion,
  filterSuggestions,
} from "../SearchField/SearchField.utils";
import styles from "../SearchField/SearchField.module.css";

export type { SearchSuggestion } from "../SearchField/SearchField.utils";

export interface SearchFieldWithSuggestionsProps extends SearchFieldProps {
  /** Static suggestions, filtered against the query client-side and offered in a dropdown. */
  suggestions?: SearchSuggestion[];
  /** Loads suggestions for a query, e.g. from an API. Calls are debounced by `debounceDelay` and out-of-order responses are discarded. */
  loadSuggestions?: (query: string) => Promise<SearchSuggestion[]>;
  /** Called when the user picks a suggestion from the dropdown. */
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
}

/**
 * A SearchField with an attached suggestions dropdown.
 */
export function SearchFieldWithSuggestions({
  suggestions,
  loadSuggestions,
  onSuggestionSelect,
  value: controlledValue,
  defaultValue,
  onChange,
  onSubmit,
  onClear,
  onSearch,
  debounceDelay = DEFAULT_DEBOUNCE_DELAY,
  ...fieldProps
}: SearchFieldWithSuggestionsProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const inputValue = controlledValue ?? internalValue;
  const [isOpen, setIsOpen] = useState(false);

  const { loadedSuggestions, isLoading, search, cancelSearch } =
    useSearchSuggestions({ onSearch, loadSuggestions, debounceDelay });

  // Static suggestions are filtered here; loaded suggestions already match the
  // query, so they are shown as-is.
  const items = useMemo(
    () =>
      suggestions
        ? filterSuggestions(suggestions, inputValue)
        : loadedSuggestions,
    [suggestions, inputValue, loadedSuggestions]
  );

  const setValue = useCallback(
    (next: string) => {
      setInternalValue(next);
      onChange?.(next);
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (next: string) => {
      setValue(next);
      search(next);
      // Open while there is something to search; a query with no matches still
      // opens so the empty / loading state is visible.
      setIsOpen(next !== "");
    },
    [setValue, search]
  );

  const handleAction = useCallback(
    (key: Key) => {
      const suggestion = items.find((item) => item.id === key);
      if (!suggestion) return;
      cancelSearch();
      setValue(suggestion.label);
      onSuggestionSelect?.(suggestion);
      setIsOpen(false);
    },
    [items, cancelSearch, setValue, onSuggestionSelect]
  );

  const handleClear = useCallback(() => {
    setValue("");
    search("");
    onClear?.();
    setIsOpen(false);
  }, [setValue, search, onClear]);

  // Key handling runs in the capture phase — before react-aria's SearchField
  // handlers — so Enter and Escape can be arbitrated for the dropdown before
  // the field's builtin Enter submit / Escape clear fire.
  const handleKeyDownCapture = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // Only arbitrate keys from the input itself; leave the clear / search
      // buttons' own keyboard activation alone.
      if (!(event.target instanceof HTMLInputElement)) return;
      const input = event.target;
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        const activeId = input.getAttribute("aria-activedescendant");
        const activeKey = activeId
          ? document.getElementById(activeId)?.getAttribute("data-key")
          : null;
        if (activeKey != null) {
          // A suggestion is highlighted: pick it instead of submitting.
          handleAction(activeKey);
        } else {
          onSubmit?.(inputValue);
          setIsOpen(false);
        }
      } else if (event.key === "Escape" && isOpen) {
        // First Escape closes the dropdown; stop it here so the SearchField
        // does not also clear the field. A later Escape (dropdown closed) falls
        // through to the SearchField's own clear.
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(false);
      }
    },
    [handleAction, onSubmit, inputValue, isOpen]
  );

  return (
    <AriaAutocomplete
      inputValue={inputValue}
      onInputChange={handleInputChange}
      disableAutoFocusFirst
    >
      <SearchField
        {...fieldProps}
        groupRef={groupRef}
        onClear={handleClear}
        onSubmit={(v) => {
          onSubmit?.(v);
          setIsOpen(false);
        }}
        onKeyDownCapture={handleKeyDownCapture}
      />
      <Popover
        hideArrow
        isNonModal
        triggerRef={groupRef}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        className={styles.searchPopover}
      >
        <DropdownListBox<SearchSuggestion>
          items={items}
          onAction={handleAction}
          renderEmptyState={() =>
            isLoading ? "Searching…" : "No results found."
          }
        >
          {(item) => <DropdownItem id={item.id}>{item.label}</DropdownItem>}
        </DropdownListBox>
      </Popover>
    </AriaAutocomplete>
  );
}
