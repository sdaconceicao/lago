"use client";
import { PlainSearchField } from "./BaseComponents/PlainSearchField";
import { SuggestingSearchField } from "./BaseComponents/SuggestingSearchField";
import type { SearchFieldProps } from "./SearchField.types";

/**
 * A search input sized and styled to match the TextField, with a trailing
 * search button and a clear button that appears while the field has a value.
 * Typing fires a debounced `onSearch`; when `suggestions` or `loadSuggestions`
 * is provided the field offers matching suggestions in a dropdown, selectable
 * via keyboard or pointer.
 */
export function SearchField(props: SearchFieldProps) {
  const hasSuggestions =
    props.suggestions !== undefined || props.loadSuggestions !== undefined;
  return hasSuggestions ? (
    <SuggestingSearchField {...props} />
  ) : (
    <PlainSearchField {...props} />
  );
}

export type { SearchFieldProps } from "./SearchField.types";
export type { SearchSuggestion } from "./SearchField.utils";
