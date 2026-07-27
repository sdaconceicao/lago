"use client";
import clsx from "clsx";
import { X } from "lucide-react";
import {
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  type ComboBoxState,
  ComboBoxStateContext,
  type Key,
} from "react-aria-components/ComboBox";
import { TagGroup } from "@/components/Collections/Tag/TagGroup/TagGroup";
import { Tag } from "@/components/Collections/Tag/TagItem/Tag";
import tagStyles from "@/components/Collections/Tag/TagItem/Tag.module.css";
import utils from "@/styles/utilities.module.css";
import styles from "./MultiSelectTags.module.css";

type SelectedItem = ComboBoxState<unknown, "multiple">["selectedItems"][number];

export interface MultiSelectTagsProps {
  /**
   * Templates the indicator shown for the selected tags that don't fit on
   * the single line, e.g. selecting five fruits might render the first two
   * tags followed by "+3 more". Receives the number of hidden tags.
   * Defaults to "+{count} more".
   */
  moreItemsTemplate?: (count: number) => string;
}

const defaultMoreItemsTemplate = (count: number) => `+${count} more`;

/**
 * Renders the MultiSelect's selected items as removable tag chips, keeping
 * them on a single line: as many tags as fit are shown, and the rest
 * collapse into a "+N more" indicator (wording set via `moreItemsTemplate`).
 * Reads the selection from the surrounding ComboBox state, so it must be
 * rendered inside a MultiSelect.
 */
export function MultiSelectTags({
  moreItemsTemplate = defaultMoreItemsTemplate,
}: MultiSelectTagsProps) {
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

  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreMeasureRef = useRef<HTMLSpanElement>(null);
  const [visibleCount, setVisibleCount] = useState(selectedItems.length);

  // Measures a plain-markup clone of every tag (same classes as the real
  // chips, so widths match, but no react-aria collection involved) against
  // the space available in the row, keeping only as many as fit before the
  // "more" indicator. Recomputes on selection change or resize.
  useLayoutEffect(() => {
    const row = rowRef.current;
    const measure = measureRef.current;
    if (!row || !measure) return;

    const recompute = () => {
      const field = row.parentElement;
      if (!field) return;

      // `row` (the visible tags container) can't be used to measure
      // available space directly: it has flex-grow:0, so it shrinks to fit
      // whatever's currently shown, making that measurement circular with
      // the count we're trying to compute. Instead derive the ceiling from
      // the stable field layout: its content box, minus the input's fixed
      // min-width floor (its only guaranteed size) and the gap between them.
      const fieldStyle = getComputedStyle(field);
      const paddingLeft = Number.parseFloat(fieldStyle.paddingLeft) || 0;
      const paddingRight = Number.parseFloat(fieldStyle.paddingRight) || 0;
      const fieldGap = Number.parseFloat(fieldStyle.columnGap) || 0;
      const inputEl = field.querySelector("input");
      const inputMinWidth = inputEl
        ? Number.parseFloat(getComputedStyle(inputEl).minWidth) || 0
        : 0;
      const available =
        field.clientWidth -
        paddingLeft -
        paddingRight -
        fieldGap -
        inputMinWidth;

      const tagEls = measure.querySelectorAll<HTMLElement>(
        `.${CSS.escape(tagStyles.tag)}`
      );
      const gap =
        Number.parseFloat(getComputedStyle(row).columnGap || "0") || 0;
      const moreWidth = moreMeasureRef.current?.offsetWidth ?? 0;

      const totalWidth = Array.from(tagEls, (el) => el.offsetWidth).reduce(
        (sum, width, i) => sum + width + (i > 0 ? gap : 0),
        0
      );

      // Everything fits on the line as-is; no need to reserve room for the
      // "more" indicator, so don't let it force an early truncation.
      if (totalWidth <= available) {
        setVisibleCount(selectedItems.length);
        return;
      }

      let used = 0;
      let count = 0;
      for (let i = 0; i < selectedItems.length && i < tagEls.length; i++) {
        const tagWidth = tagEls[i].offsetWidth;
        const withTag = used + (count > 0 ? gap : 0) + tagWidth;
        const hasMoreAfter = i < selectedItems.length - 1;
        const withReserve = withTag + (hasMoreAfter ? gap + moreWidth : 0);
        if (count > 0 && withReserve > available) break;
        used = withTag;
        count += 1;
      }
      setVisibleCount(count);
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(row.parentElement ?? row);
    return () => observer.disconnect();
  }, [selectedItems]);

  if (selectedItems.length === 0) {
    return null;
  }

  const visibleItems = selectedItems.slice(0, visibleCount);
  const hiddenCount = selectedItems.length - visibleItems.length;

  return (
    <div className={styles.tags} ref={rowRef}>
      <TagGroup
        aria-label="Selected items"
        size="md"
        variant="default"
        items={visibleItems}
        onRemove={onRemove}
      >
        {(item) => (
          <Tag id={item.key} textValue={item.textValue}>
            {item.textValue}
          </Tag>
        )}
      </TagGroup>
      {hiddenCount > 0 && (
        <span className={styles.moreIndicator}>
          {moreItemsTemplate(hiddenCount)}
        </span>
      )}
      <div className={styles.measure} aria-hidden ref={measureRef}>
        <div
          className="react-aria-TagGroup"
          data-size="md"
          data-variant="default"
        >
          {selectedItems.map((item) => (
            <div
              key={item.key}
              className={clsx(utils.buttonBase, tagStyles.tag)}
            >
              {item.textValue}
              <span className={tagStyles.removeButton}>
                <X />
              </span>
            </div>
          ))}
        </div>
      </div>
      <span className={styles.measure} aria-hidden ref={moreMeasureRef}>
        <span className={styles.moreIndicator}>
          {moreItemsTemplate(selectedItems.length)}
        </span>
      </span>
    </div>
  );
}
