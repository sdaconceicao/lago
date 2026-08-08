"use client";
import clsx from "clsx";
import { useCallback, useContext } from "react";
import { ComboBoxStateContext, Input } from "react-aria-components/ComboBox";
import {
  applySelectionAction,
  isSelectionActionKey,
} from "@/components/Inputs/MultiSelect/MultiSelect.utils";
import styles from "./MultiSelectInput.module.css";

export interface MultiSelectInputProps {
  /** Placeholder text for the search input. Shown only while no items are selected. */
  placeholder?: string;
}

/**
 * The MultiSelect's search input. Reads the surrounding ComboBox state to
 * hide the placeholder once items are selected, to run the dropdown's selection
 * controls on Enter, and to remove the most recently selected item on Backspace
 * when the input is empty.
 */
export function MultiSelectInput({ placeholder }: MultiSelectInputProps) {
  const state = useContext(ComboBoxStateContext);
  const isSelectionEmpty = (state?.selectedItems.length ?? 0) === 0;

  // Enter on a focused selection control has to be caught in the capture phase:
  // react-aria's own Enter handler is on this input too, and it would commit the
  // focused option and close the menu. Stopping the event there keeps the menu
  // open, as it stays when a control is clicked, and preventing the default
  // stops the Enter from submitting a surrounding form.
  const onKeyDownCapture = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter" || !state?.isOpen) {
        return;
      }
      const focusedKey = state.selectionManager.focusedKey;
      if (!isSelectionActionKey(focusedKey)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      applySelectionAction(state, focusedKey);
    },
    [state]
  );

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
      onKeyDownCapture={onKeyDownCapture}
      onKeyDown={onKeyDown}
    />
  );
}
