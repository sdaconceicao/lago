"use client";
import clsx from "clsx";
import { useCallback, useContext } from "react";
import { ComboBoxStateContext, Input } from "react-aria-components/ComboBox";
import styles from "./MultiSelectInput.module.css";

export interface MultiSelectInputProps {
  /** Placeholder text for the search input. Shown only while no items are selected. */
  placeholder?: string;
}

/**
 * The MultiSelect's search input. Reads the surrounding ComboBox state to
 * hide the placeholder once items are selected and to remove the most
 * recently selected item on Backspace when the input is empty.
 */
export function MultiSelectInput({ placeholder }: MultiSelectInputProps) {
  const state = useContext(ComboBoxStateContext);
  const isSelectionEmpty = (state?.selectedItems.length ?? 0) === 0;

  // Backspace in an empty input removes the most recently selected item.
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Backspace" || !state || state.inputValue !== "") {
        return;
      }
      const value = Array.isArray(state.value) ? state.value : [];
      if (value.length === 0) return;
      state.setValue(value.slice(0, -1));
    },
    [state]
  );

  return (
    <Input
      className={clsx("react-aria-Input", styles.input)}
      placeholder={isSelectionEmpty ? placeholder : undefined}
      onKeyDown={onKeyDown}
    />
  );
}
