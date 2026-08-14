"use client";
import clsx from "clsx";
import { useCallback, useContext } from "react";
import { ComboBoxStateContext, type Key } from "react-aria-components/ComboBox";
import { VisuallyHidden } from "react-aria-components/VisuallyHidden";
import { TagGroup } from "@/components/Collections/Tag/TagGroup/TagGroup";
import { Tag } from "@/components/Collections/Tag/TagItem/Tag";
import {
  DEFAULT_FIELD_SIZE,
  type FieldSize,
} from "@/components/Inputs/FormComponents/index";
import { useTagOverflow } from "./MultiSelectTags.hooks";
import styles from "./MultiSelectTags.module.css";
import type { SelectedItem } from "./MultiSelectTags.utils";

export interface MultiSelectTagsProps {
  /**
   * The field size the tags sit in. At `"sm"` and `"md"` the tags that do not
   * fit collapse into a "+N" counter; at `"lg"` they all render and wrap.
   */
  size?: FieldSize;
}

/**
 * Renders the MultiSelect's selected items as removable tag chips. Reads the
 * selection from the surrounding ComboBox state, so it must be rendered inside
 * a MultiSelect. How many chips fit is decided by `useTagOverflow`.
 */
export function MultiSelectTags({
  size = DEFAULT_FIELD_SIZE,
}: MultiSelectTagsProps) {
  const state = useContext(ComboBoxStateContext);
  const selectedItems: SelectedItem[] = state?.selectedItems ?? [];
  const { setTagsRef, collapses, visible, hidden } = useTagOverflow(
    selectedItems,
    size
  );

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
    <div className={styles.tags} ref={setTagsRef}>
      <TagGroup
        aria-label="Selected items"
        size="md"
        variant="default"
        items={selectedItems.slice(0, visible)}
        onRemove={onRemove}
      >
        {(item) => (
          <Tag id={item.key} textValue={item.textValue}>
            {item.textValue}
          </Tag>
        )}
      </TagGroup>
      {hidden > 0 && (
        <span className={styles.counter}>
          <span aria-hidden="true">+{hidden}</span>
          <VisuallyHidden>{hidden} more selected</VisuallyHidden>
        </span>
      )}
      {/* Off-flow copy the hook measures the counter's width against, so it can
          be read on a pass where no counter is shown. */}
      {collapses && selectedItems.length > 1 && (
        <span
          aria-hidden="true"
          className={clsx(styles.counter, styles.counterProbe)}
        >
          +{selectedItems.length - 1}
        </span>
      )}
    </div>
  );
}
