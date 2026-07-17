/** Default debounce, in milliseconds, applied to search and suggestion loading. */
export const DEFAULT_DEBOUNCE_DELAY = 300;

/** A selectable entry shown in the SearchField suggestions dropdown. */
export interface SearchSuggestion {
  /** Unique identifier for the suggestion. */
  id: string;
  /** Text displayed in the dropdown and filled into the field when the suggestion is selected. */
  label: string;
}

/**
 * Case-insensitive "contains" filter for a static suggestion list. An empty
 * or whitespace-only query matches every suggestion. Does not mutate the
 * input array.
 */
export const filterSuggestions = (
  suggestions: SearchSuggestion[],
  query: string
): SearchSuggestion[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return suggestions;
  return suggestions.filter((suggestion) =>
    suggestion.label.toLowerCase().includes(normalizedQuery)
  );
};
