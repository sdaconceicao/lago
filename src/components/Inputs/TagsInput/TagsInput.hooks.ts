import { useCallback, useMemo, useRef, useState } from "react";
import type { Key } from "react-aria-components/ComboBox";
import {
  addKey,
  CREATE_KEY,
  findItemByLabel,
  getCollectionItems,
  isSameKeys,
  mergeItems,
  replaceCreateKey,
  type TagsInputItem,
} from "./TagsInput.utils";

/**
 * Holds a key list at a stable reference for as long as its contents are
 * unchanged.
 *
 * React Aria's ComboBox compares its controlled value by identity to decide
 * whether the selection changed, and resets the input value when it did. A
 * caller passing a fresh array literal on every render — `value={[...tags]}`,
 * the natural thing to write — would otherwise have the input cleared on every
 * keystroke. Freezing the reference makes that impossible.
 */
export const useStableKeys = (keys: Key[]): Key[] => {
  const stable = useRef(keys);
  if (stable.current !== keys && !isSameKeys(stable.current, keys)) {
    stable.current = keys;
  }
  return stable.current;
};

export interface UseTagsInputStateOptions {
  /** The options the caller offered. */
  items: TagsInputItem[];
  /** Selected keys, when the caller controls them. */
  value?: Key[];
  /** Initially selected keys, when the caller does not. */
  defaultValue?: Key[];
  /** Called with the full selection whenever a tag is added or removed. */
  onChange?: (keys: Key[]) => void;
  /** Whether a query matching no option can be added as a new tag. */
  allowsCreate: boolean;
  /** Called with each item the user creates. */
  onCreate?: (item: TagsInputItem) => void;
  /** Called as the query changes, after the TagsInput's own bookkeeping. */
  onInputChange?: (value: string) => void;
}

/**
 * Selection, creation, and query state for a TagsInput.
 *
 * The selection is always handed to the ComboBox as a controlled value: picking
 * the create row has to be intercepted so the synthetic key can be swapped for
 * a real item's, which is only possible while the value passes through here.
 * The input value stays uncontrolled, so React Aria keeps clearing it after
 * each selection on its own; this only observes it to build the create row.
 */
export const useTagsInputState = ({
  items,
  value,
  defaultValue,
  onChange,
  allowsCreate,
  onCreate,
  onInputChange,
}: UseTagsInputStateOptions) => {
  const [uncontrolledKeys, setUncontrolledKeys] = useState<Key[]>(
    () => defaultValue ?? []
  );
  const [createdItems, setCreatedItems] = useState<TagsInputItem[]>([]);
  const [query, setQuery] = useState("");

  const selectedKeys = useStableKeys(value ?? uncontrolledKeys);

  const knownItems = useMemo(
    () => mergeItems(items, createdItems),
    [items, createdItems]
  );

  const collectionItems = useMemo(
    () => getCollectionItems({ items: knownItems, query, allowsCreate }),
    [knownItems, query, allowsCreate]
  );

  const setSelectedKeys = useCallback(
    (keys: Key[]) => {
      if (value === undefined) {
        setUncontrolledKeys(keys);
      }
      onChange?.(keys);
    },
    [value, onChange]
  );

  /** Registers a brand new item and reports it, returning the item to select. */
  const createItem = useCallback(
    (label: string): TagsInputItem => {
      // The label doubles as the key: a tag the user typed has no identity
      // beyond its text, and reusing it keeps a repeat of the same word from
      // becoming a second tag.
      const item = { id: label, label };
      setCreatedItems((current) => [...current, item]);
      onCreate?.(item);
      return item;
    },
    [onCreate]
  );

  /**
   * The ComboBox's own selection changes. Everything passes straight through
   * except the create row, whose synthetic key is swapped for a real item.
   */
  const handleChange = useCallback(
    (keys: Key[]) => {
      if (!keys.includes(CREATE_KEY)) {
        setSelectedKeys(keys);
        return;
      }
      const label = query.trim();
      // The row is only offered for a label that does not exist yet, but a
      // stale query could still resolve to a known item — select that instead
      // of minting a duplicate.
      const item = findItemByLabel(knownItems, label) ?? createItem(label);
      setSelectedKeys(replaceCreateKey(keys, item.id));
    },
    [setSelectedKeys, query, knownItems, createItem]
  );

  /** Tracks the query for the create row and forwards it to the caller. */
  const handleInputChange = useCallback(
    (next: string) => {
      setQuery(next);
      onInputChange?.(next);
    },
    [onInputChange]
  );

  /**
   * Adds the typed text as a tag: an existing option when the text names one,
   * a new item when creation is allowed. Returns whether the text was consumed,
   * which tells the input whether to clear itself.
   */
  const addQuery = useCallback(
    (text: string): boolean => {
      const label = text.trim();
      if (label === "") return false;

      const existing = findItemByLabel(knownItems, label);
      if (existing) {
        setSelectedKeys(addKey(selectedKeys, existing.id));
        return true;
      }
      if (!allowsCreate) return false;

      setSelectedKeys(addKey(selectedKeys, createItem(label).id));
      return true;
    },
    [knownItems, selectedKeys, setSelectedKeys, allowsCreate, createItem]
  );

  return {
    selectedKeys,
    collectionItems,
    handleChange,
    handleInputChange,
    addQuery,
  };
};
