import {
  type SearchFieldProps as AriaSearchFieldProps,
  type ValidationResult,
} from "react-aria-components/SearchField";
import type { SearchSuggestion } from "./SearchField.utils";

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
  /** Milliseconds to wait after the last keystroke before `onSearch` / `loadSuggestions` fire. Defaults to 300. */
  debounceDelay?: number;
  /** Static suggestions, filtered against the query client-side and offered in a dropdown. */
  suggestions?: SearchSuggestion[];
  /** Loads suggestions for a query, e.g. from an API. Calls are debounced by `debounceDelay` and out-of-order responses are discarded. */
  loadSuggestions?: (query: string) => Promise<SearchSuggestion[]>;
  /** Called when the user picks a suggestion from the dropdown. */
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
}
