"use client";
import { useCallback, useContext } from "react";
import {
  type ComboBoxState,
  ComboBoxStateContext,
  type Key,
} from "react-aria-components/ComboBox";
import { Tag, TagGroup } from "@/components/TagGroup/TagGroup";
import styles from "./MultiSelectTags.module.css";

type SelectedItem = ComboBoxState<unknown, "multiple">["selectedItems"][number];

/**
 * Renders the MultiSelect's selected items as removable tag chips. Reads the
 * selection from the surrounding ComboBox state, so it must be rendered
 * inside a MultiSelect.
 */
export function MultiSelectTags() {
  const state = useContext(ComboBoxStateContext);
  const selectedItems: SelectedItem[] = state?.selectedItems ?? [];

  const onRemove = useCallback(
    (keys: Set<Key>) => {
      if (!state) return;
      const value = Array.isArray(state.value) ? state.value : [];
      state.setValue(value.filter((key) => !keys.has(key)));
    },
    [state]
  );

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.tags}>
      <TagGroup
        aria-label="Selected items"
        size="md"
        variant="default"
        items={selectedItems}
        onRemove={onRemove}
      >
        {(item) => (
          <Tag id={item.key} textValue={item.textValue}>
            {item.textValue}
          </Tag>
        )}
      </TagGroup>
    </div>
  );
}
