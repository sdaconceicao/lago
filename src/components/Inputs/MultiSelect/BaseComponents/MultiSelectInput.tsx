"use client";
import clsx from "clsx";
import { forwardRef, useCallback, useContext } from "react";
import { ComboBoxStateContext, Input } from "react-aria-components/ComboBox";
import { getSelectedKeys } from "@/components/Inputs/MultiSelect/MultiSelect.utils";
import styles from "./MultiSelectInput.module.css";
import { MultiSelectToolbarContext } from "./MultiSelectToolbar";

export interface MultiSelectInputProps {
  /** Placeholder text for the search input. Shown only while no items are selected. */
  placeholder?: string;
}

/**
 * The MultiSelect's search input. Reads the surrounding ComboBox state to hide
 * the placeholder once items are selected, to hand Tab / ArrowUp over to the
 * dropdown's selection controls, and to remove the most recently selected item
 * on Backspace when the input is empty.
 */
export const MultiSelectInput = forwardRef<
  HTMLInputElement,
  MultiSelectInputProps
>(function MultiSelectInput({ placeholder }, ref) {
  const state = useContext(ComboBoxStateContext);
  const bridge = useContext(MultiSelectToolbarContext);
  const isSelectionEmpty = (state?.selectedItems.length ?? 0) === 0;

  // The selection controls live in the popover, which is portaled to the end of
  // the document, so Tab would sail straight past them to whatever follows the
  // field. Sending it to the first control instead puts them where they would
  // be if the dropdown were rendered inline. From there the browser takes over:
  // react-aria's popover already routes a Tab out of the overlay to the element
  // after the field, so nothing has to catch the way back out.
  //
  // ArrowUp does the same when virtual focus is at the top of the list (or has
  // not entered it yet), so the controls sit on the arrow path above the
  // options. Deeper in the list, ArrowUp is left to react-aria.
  //
  // The capture phase is what makes this work: react-aria's own Tab / Arrow
  // handlers are on this input too, and Tab would commit the value and close
  // the menu. Modified Tab is left alone — it belongs to the browser and the OS.
  const onKeyDownCapture = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!state?.isOpen || !bridge) {
        return;
      }

      if (
        event.key === "Tab" &&
        !event.shiftKey &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        // The first control is disabled whenever it would change nothing, and a
        // disabled button cannot take focus: aim at the first one that can, and
        // leave Tab alone when neither can, rather than swallowing it.
        const control =
          bridge.toolbarRef.current?.querySelector<HTMLButtonElement>(
            "button:not([disabled])"
          );
        if (!control) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        control.focus();
        return;
      }

      if (event.key !== "ArrowUp") {
        return;
      }

      const focusedKey = state.selectionManager.focusedKey;
      const firstKey = state.collection.getFirstKey();
      const atTopOfList = focusedKey == null || focusedKey === firstKey;
      if (!atTopOfList) {
        return;
      }

      const control =
        bridge.toolbarRef.current?.querySelector<HTMLButtonElement>(
          "button:not([disabled])"
        );
      if (!control) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      state.selectionManager.setFocusedKey(null);
      control.focus();
    },
    [bridge, state]
  );

  // Backspace in an empty input removes the most recently selected item.
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Backspace" || !state || state.inputValue !== "") {
        return;
      }
      const value = getSelectedKeys(state);
      if (value.length === 0) return;
      state.setValue(value.slice(0, -1));
    },
    [state]
  );

  return (
    <Input
      ref={ref}
      className={clsx("react-aria-Input", styles.input)}
      placeholder={isSelectionEmpty ? placeholder : undefined}
      onKeyDownCapture={onKeyDownCapture}
      onKeyDown={onKeyDown}
    />
  );
});
