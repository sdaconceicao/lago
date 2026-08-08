import type { ContextType } from "react";
import type { Key } from "react-aria-components/Collection";
import type { ComboBoxStateContext } from "react-aria-components/ComboBox";

/** The live ComboBox state, as published to the field's base components. */
export type MultiSelectState = NonNullable<
  ContextType<typeof ComboBoxStateContext>
>;

/**
 * Option keys for the dropdown's selection controls. They are real members of
 * the collection — that is what puts them in the arrow key order — so they are
 * namespaced to stay clear of any key a caller might use for an option.
 */
export const SELECT_ALL_KEY = "lago-multi-select-all";
export const SELECT_NONE_KEY = "lago-multi-select-none";

/** Whether `key` belongs to a selection control rather than to an option. */
export function isSelectionActionKey(
  key: Key | null | undefined
): key is typeof SELECT_ALL_KEY | typeof SELECT_NONE_KEY {
  return key === SELECT_ALL_KEY || key === SELECT_NONE_KEY;
}

/**
 * `keys` first, in the order the list offers them, followed by anything already
 * selected that the list is not offering. Filtering narrows the list, so the
 * trailing part is what keeps a selection made before the filter was typed.
 */
export function addKeys(current: readonly Key[], keys: readonly Key[]): Key[] {
  const added = new Set(keys);
  return [...keys, ...current.filter((key) => !added.has(key))];
}

/** `current` without any of `keys`, in its existing order. */
export function removeKeys(
  current: readonly Key[],
  keys: readonly Key[]
): Key[] {
  const removed = new Set(keys);
  return current.filter((key) => !removed.has(key));
}

/**
 * Whether both lists hold the same keys, in any order. Selections never repeat
 * a key, so comparing lengths and membership is enough.
 */
export function hasSameKeys(a: readonly Key[], b: readonly Key[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const keys = new Set(a);
  return b.every((key) => keys.has(key));
}

/** The field's current value as a key list, whatever selection mode reports. */
export function getSelectedKeys(state: MultiSelectState): readonly Key[] {
  return Array.isArray(state.value) ? state.value : [];
}

/**
 * Every option the list is currently offering. Reads the displayed collection,
 * so a typed filter narrows it, and skips the selection controls and any
 * disabled option — neither can be selected.
 */
export function getSelectableKeys(state: MultiSelectState): Key[] {
  const keys: Key[] = [];
  for (const key of state.collection.getKeys()) {
    if (
      state.collection.getItem(key)?.type === "item" &&
      state.selectionManager.canSelectItem(key)
    ) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Runs the selection control identified by `key`. Returns whether the key was
 * a control at all, so callers can tell one apart from an ordinary option.
 *
 * Both controls act on the options currently on offer and leave the rest of
 * the selection alone: with no filter typed that is the whole list, and with
 * one typed it is the matches, which is what the visible checkboxes promise.
 */
export function applySelectionAction(
  state: MultiSelectState,
  key: Key | null | undefined
): boolean {
  if (!isSelectionActionKey(key)) {
    return false;
  }

  const current = getSelectedKeys(state);
  const onOffer = getSelectableKeys(state);
  const next =
    key === SELECT_ALL_KEY
      ? addKeys(current, onOffer)
      : removeKeys(current, onOffer);

  // A control that would not change anything — "select all" with everything
  // already checked — must not notify onChange or reorder the selection.
  if (!hasSameKeys(current, next)) {
    state.setValue(next);
  }
  return true;
}
