import type { ContextType } from "react";
import type { Key } from "react-aria-components/Collection";
import type { ComboBoxStateContext } from "react-aria-components/ComboBox";

/** The live ComboBox state, as published to the field's base components. */
export type MultiSelectState = NonNullable<
  ContextType<typeof ComboBoxStateContext>
>;

/**
 * Existing selection first (unchanged order), then any of `keys` not already
 * selected, in the order the list offers them. Filtering narrows the list, so
 * newly matched keys are appended — Backspace still removes the most recently
 * selected item after a select-all.
 */
export function addKeys(current: readonly Key[], keys: readonly Key[]): Key[] {
  const existing = new Set(current);
  return [...current, ...keys.filter((key) => !existing.has(key))];
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
 * so a typed filter narrows it, and skips anything that is not a selectable
 * option — section headers, loading indicators, and disabled options.
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
