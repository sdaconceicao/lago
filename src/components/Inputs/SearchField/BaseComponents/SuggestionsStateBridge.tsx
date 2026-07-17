"use client";
import type React from "react";
import { useContext, useEffect } from "react";
import {
  type ComboBoxState,
  ComboBoxStateContext,
} from "react-aria-components/ComboBox";
import type { SearchSuggestion } from "../SearchField.utils";

export interface SuggestionsStateBridgeProps {
  /** Ref populated with the live ComboBox state. */
  stateRef: React.RefObject<ComboBoxState<SearchSuggestion> | null>;
}

/**
 * Stashes the ComboBox state in a ref so the SuggestingSearchField's selection,
 * clear, and submit handlers can open and close the suggestions popover
 * imperatively. The selection is pinned to null for repeatable picks, so the
 * ComboBox never closes the popover on selection itself.
 */
export function SuggestionsStateBridge({
  stateRef,
}: SuggestionsStateBridgeProps) {
  const state = useContext(
    ComboBoxStateContext
  ) as ComboBoxState<SearchSuggestion> | null;
  useEffect(() => {
    stateRef.current = state;
  });
  return null;
}
