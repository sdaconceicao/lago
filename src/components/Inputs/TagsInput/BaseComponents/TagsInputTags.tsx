"use client";
import { useCallback, useContext, useMemo } from "react";
import {
  type ComboBoxState,
  ComboBoxStateContext,
  type Key,
} from "react-aria-components/ComboBox";
import { TagGroup } from "@/components/Collections/Tag/TagGroup/TagGroup";
import { Tag } from "@/components/Collections/Tag/TagItem/Tag";
import styles from "./TagsInputTags.module.css";

type SelectedItem = ComboBoxState<unknown, "multiple">["selectedItems"][number];

export interface TagsInputTagsProps {
  /** The shape of the chips: "round" renders pills, "default" matches the input border radius. */
  variant?: "default" | "round";
  /** Whether the chips are dimmed and cannot be removed. Mirrors the field's disabled and read-only states. */
  isDisabled?: boolean;
  /** Accessible label for the group of chips. */
  "aria-label"?: string;
}

/**
 * Renders the TagsInput's selected items as removable chips below the field.
 * Reads the selection from the surrounding ComboBox state, so it must be
 * rendered inside a TagsInput.
 *
 * The group is always sized "md", the size at which a chip takes its metrics
 * from the `--field-*` scope. That means the chips scale with the field the
 * TagsInput renders at rather than being fixed, so they follow the `size` prop
 * without it being passed down.
 */
export function TagsInputTags({
  variant = "round",
  isDisabled = false,
  "aria-label": ariaLabel = "Selected tags",
}: TagsInputTagsProps) {
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

  // React Aria's TagGroup has no group-level disabled state, only disabled
  // keys, so a disabled field disables every chip it holds.
  const disabledKeys = useMemo(
    () => (isDisabled ? selectedItems.map((item) => item.key) : []),
    [isDisabled, selectedItems]
  );

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <TagGroup
      aria-label={ariaLabel}
      className={styles.tags}
      size="md"
      variant={variant}
      disabledKeys={disabledKeys}
      items={selectedItems}
      // Withheld rather than made a no-op: a chip that cannot be removed should
      // not render a remove button offering to.
      onRemove={isDisabled ? undefined : onRemove}
    >
      {(item) => (
        <Tag id={item.key} textValue={item.textValue}>
          {item.textValue}
        </Tag>
      )}
    </TagGroup>
  );
}
