"use client";
import { createContext, type RefObject, useCallback, useContext } from "react";
import { ComboBoxStateContext } from "react-aria-components/ComboBox";
import { Button } from "@/components/Actions/Button/Button";
import { Toolbar } from "@/components/Actions/Toolbar/Toolbar";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
import {
  addKeys,
  getSelectableKeys,
  getSelectedKeys,
  hasSameKeys,
  removeKeys,
} from "@/components/Inputs/MultiSelect/MultiSelect.utils";
import styles from "./MultiSelectToolbar.module.css";

/** Refs that let the search input and the toolbar hand focus to each other. */
export interface MultiSelectToolbarBridge {
  toolbarRef: RefObject<HTMLDivElement | null>;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

/**
 * Publishes the toolbar ↔ input focus bridge. `null` while `allowsSelectAll` is
 * off, which is how the input knows to leave Tab / ArrowUp alone.
 */
export const MultiSelectToolbarContext =
  createContext<MultiSelectToolbarBridge | null>(null);

export interface MultiSelectToolbarProps {
  /** Label for the control that checks every option on offer. */
  selectAllLabel: string;
  /** Label for the control that unchecks every option on offer. */
  selectNoneLabel: string;
  /** The field's size, so the controls match the rows beneath them. */
  size: FieldSize;
}

/**
 * The MultiSelect dropdown's selection controls: a pinned toolbar of two
 * buttons above the options.
 *
 * They are rendered inside the popover but outside the listbox, so they are not
 * members of the collection. That is what keeps the typed filter from matching
 * their own labels, keeps the listbox's empty state working, and stops a screen
 * reader announcing them as unselected options. Because they are ordinary
 * buttons the press handler can live on them directly, reading the live state
 * from context.
 *
 * Both act on the options currently on offer and leave the rest of the
 * selection alone: with no filter typed that is the whole list, and with one
 * typed it is the matches, which is what the visible checkboxes promise.
 * Disabled options are never selected. A control that would change nothing is
 * disabled rather than silently inert.
 */
export function MultiSelectToolbar({
  selectAllLabel,
  selectNoneLabel,
  size,
}: MultiSelectToolbarProps) {
  const state = useContext(ComboBoxStateContext);
  const bridge = useContext(MultiSelectToolbarContext);

  // ArrowDown returns to the search input and puts virtual focus on the first
  // option, so the next ArrowDown continues into the list as usual. Left/Right
  // stay with the Toolbar for moving between the two controls.
  //
  // Focusing the trigger from inside the portaled popover can race the
  // overlay's focusout and close the menu; open() after focus keeps it up.
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "ArrowDown" || !state || !bridge) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      bridge.searchInputRef.current?.focus();
      state.open();
      const firstKey = state.collection.getFirstKey();
      if (firstKey != null) {
        state.selectionManager.setFocusedKey(firstKey);
      }
    },
    [bridge, state]
  );

  if (!state) {
    return null;
  }

  const selected = getSelectedKeys(state);
  const onOffer = getSelectableKeys(state);
  const withAll = addKeys(selected, onOffer);
  const withNone = removeKeys(selected, onOffer);

  return (
    <div
      ref={bridge?.toolbarRef ?? undefined}
      className={styles.toolbarRow}
      onKeyDown={onKeyDown}
    >
      <Toolbar aria-label="Selection" className={styles.toolbar}>
        <Button
          size={size}
          variant="quiet"
          // Focus belongs in the search input: it is what the arrow keys drive
          // and where the caret has to stay for typing to keep filtering.
          preventFocusOnPress
          isDisabled={hasSameKeys(selected, withAll)}
          onPress={() => state.setValue(withAll)}
        >
          {selectAllLabel}
        </Button>
        <Button
          size={size}
          variant="quiet"
          preventFocusOnPress
          isDisabled={hasSameKeys(selected, withNone)}
          onPress={() => state.setValue(withNone)}
        >
          {selectNoneLabel}
        </Button>
      </Toolbar>
    </div>
  );
}
