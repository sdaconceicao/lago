"use client";
import { useCallback, useRef, useState } from "react";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { SearchSuggestion } from "./SearchField.utils";

export interface UseSearchSuggestionsOptions {
  /** Debounced callback fired with the query after the user stops typing. */
  onSearch?: (value: string) => void;
  /** Promise-based loader for suggestions. Calls are debounced and stale responses are discarded. */
  loadSuggestions?: (query: string) => Promise<SearchSuggestion[]>;
  /** Milliseconds to wait after the last keystroke before searching. */
  debounceDelay: number;
}

/**
 * Debounces search callbacks for the SearchField. `search(query)` schedules a
 * debounced `onSearch` and, for non-empty queries, a `loadSuggestions` call
 * whose results land in `loadedSuggestions`. Out-of-order responses are
 * discarded so only the latest query's results are shown, and a rejected
 * loader clears the results. Clearing the query or calling `cancelSearch`
 * invalidates any pending or in-flight work.
 */
export const useSearchSuggestions = ({
  onSearch,
  loadSuggestions,
  debounceDelay,
}: UseSearchSuggestionsOptions) => {
  const [loadedSuggestions, setLoadedSuggestions] = useState<
    SearchSuggestion[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  // Monotonic id per loadSuggestions call; bumping it invalidates in-flight requests.
  const requestIdRef = useRef(0);

  const runSearch = useCallback(
    (query: string) => {
      onSearch?.(query);
      if (!loadSuggestions || !query) return;

      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      loadSuggestions(query)
        .then((results) => {
          if (requestId !== requestIdRef.current) return;
          setLoadedSuggestions(results);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setLoadedSuggestions([]);
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          setIsLoading(false);
        });
    },
    [onSearch, loadSuggestions]
  );

  const { schedule: scheduleSearch, cancel: cancelScheduledSearch } =
    useDebouncedCallback(runSearch, debounceDelay);

  const search = useCallback(
    (query: string) => {
      if (!query) {
        requestIdRef.current++;
        setIsLoading(false);
        setLoadedSuggestions([]);
      }
      scheduleSearch(query);
    },
    [scheduleSearch]
  );

  const cancelSearch = useCallback(() => {
    cancelScheduledSearch();
    requestIdRef.current++;
    setIsLoading(false);
  }, [cancelScheduledSearch]);

  return { loadedSuggestions, isLoading, search, cancelSearch };
};
