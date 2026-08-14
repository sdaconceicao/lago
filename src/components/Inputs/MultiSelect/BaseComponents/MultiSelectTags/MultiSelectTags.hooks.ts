"use client";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import styles from "./MultiSelectTags.module.css";
import {
  createTagCache,
  getSignature,
  getVisibleTagCount,
  type Measured,
  readFieldContentWidth,
  readFieldReserve,
  readTagWidths,
  readWidth,
  type SelectedItem,
} from "./MultiSelectTags.utils";

export interface TagOverflow {
  /** Callback ref for the element wrapping the tags. */
  setTagsRef: (element: HTMLDivElement | null) => void;
  /** Whether this size collapses overflow into a counter at all. */
  collapses: boolean;
  /** How many tags to render. */
  visible: number;
  /** How many tags the counter stands in for. */
  hidden: number;
}

/**
 * Decides how many of the selected tags fit on the field's single row.
 *
 * At `sm` and `md` the field is a fixed-height row, so only the tags that
 * genuinely fit are rendered and the rest collapse into a "+N" counter. That
 * count is measured rather than configured: each tag's natural width, the "+N"
 * chip's width and the room the input and toggle button need are all read off
 * the DOM, then cached — the widths never change, so a resize only re-runs the
 * arithmetic.
 *
 * At `lg` the row wraps and grows to fit the whole selection, so nothing ever
 * collapses and no measuring happens.
 */
export const useTagOverflow = (
  selectedItems: SelectedItem[],
  size: FieldSize
): TagOverflow => {
  const collapses = size !== "lg";

  const tagsRef = useRef<HTMLDivElement | null>(null);
  const fieldRef = useRef<HTMLElement | null>(null);
  const cacheRef = useRef(createTagCache());
  /** The size the cache was measured at. */
  const cachedSizeRef = useRef(size);
  const [measured, setMeasured] = useState<Measured | null>(null);

  const [fieldElement, setFieldElement] = useState<HTMLElement | null>(null);
  const setTagsRef = useCallback((element: HTMLDivElement | null) => {
    const field = element?.parentElement ?? null;
    tagsRef.current = element;
    fieldRef.current = field;
    setFieldElement(field);
  }, []);

  /**
   * Recomputes the fitted count from the cached numbers, and commits it only
   * when it actually changed. That guard is what keeps a resize cheap: dragging
   * a sidebar fires a notification per frame but steps the count once or twice,
   * so all but a couple of those do nothing but arithmetic over a handful of
   * cached widths. Debouncing instead would trade that for visible lag.
   */
  const commit = useCallback(() => {
    const cache = cacheRef.current;
    // A tag whose width is still unknown must not be collapsed away: it would
    // then never be rendered, so it could never be measured, and the field
    // would settle on a count derived from a width of zero. Showing everything
    // is also what makes the next pass able to measure it.
    const measurable =
      collapses && cache.keys.every((key) => cache.widths.has(key));
    const count = measurable
      ? getVisibleTagCount({
          tagWidths: cache.keys.map((key) => cache.widths.get(key) ?? 0),
          availableWidth: cache.contentWidth - (cache.reserve?.reserved ?? 0),
          gap: cache.reserve?.gap ?? 0,
          counterWidth: cache.counterWidth,
        })
      : cache.keys.length;

    const previous = cache.measured;
    if (previous?.count === count && previous.signature === cache.signature)
      return;

    cache.measured = { count, signature: cache.signature };
    setMeasured(cache.measured);
  }, [collapses]);

  useResizeObserver(
    fieldElement,
    useCallback(
      ({ inlineSize }: ResizeObserverSize) => {
        cacheRef.current.contentWidth = inlineSize;
        commit();
      },
      [commit]
    )
  );

  const total = selectedItems.length;
  const signature = getSignature(selectedItems);
  // A tag that has never been rendered has no measured width, and it cannot be
  // measured unless this render puts it in the DOM. So a selection this hook
  // has not laid out yet renders in full for one prepaint commit, then
  // collapses. Already measured selections skip the pass entirely.
  const isMeasuring = collapses && measured?.signature !== signature;
  const visible =
    isMeasuring || !measured ? total : Math.min(measured.count, total);

  useLayoutEffect(() => {
    const tags = tagsRef.current;
    const field = fieldRef.current;
    if (!tags || !field) return;

    const cache = cacheRef.current;
    cache.signature = signature;
    cache.keys = selectedItems.map((item) => item.key);

    // React Aria resolves a collection in a later commit than the one that
    // renders it, so the first pass after a selection change finds a TagList
    // that is still empty.
    if (cache.keys.some((key) => !cache.widths.has(key))) {
      readTagWidths(tags).forEach((width, index) => {
        const key = cache.keys[index];
        if (key !== undefined) cache.widths.set(key, width);
      });
    }

    if (cache.counterWidth === 0) {
      cache.counterWidth = readWidth(tags, `.${styles.counterProbe}`);
    }
    cache.reserve ??= readFieldReserve(field);
    if (cache.contentWidth === 0) {
      // Only on the very first pass. Waiting for the ResizeObserver instead
      // would paint every tag once and then snap to the fitted count.
      cache.contentWidth = readFieldContentWidth(field);
    }

    commit();
  });

  // A change of size invalidates every cached measurement: the chips, the
  // input floor and the gaps are all driven by the --field-* scope.
  //
  // This must not fire on mount. The effect above has already measured and
  // committed by then, and clearing back to null in the same commit nets out
  // to the null the state started at — React sees no change, bails out of the
  // re-render, and the field is left showing every tag.
  useLayoutEffect(() => {
    if (cachedSizeRef.current === size) return;
    cachedSizeRef.current = size;
    cacheRef.current = createTagCache();
    setMeasured(null);
  }, [size]);

  return { setTagsRef, collapses, visible, hidden: total - visible };
};
