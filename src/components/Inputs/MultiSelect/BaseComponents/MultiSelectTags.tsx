"use client";
import clsx from "clsx";
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
import { VisuallyHidden } from "react-aria-components/VisuallyHidden";
import { TagGroup } from "@/components/Collections/Tag/TagGroup/TagGroup";
import { Tag } from "@/components/Collections/Tag/TagItem/Tag";
import {
  DEFAULT_FIELD_SIZE,
  type FieldSize,
} from "@/components/Inputs/FormComponents/index";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import styles from "./MultiSelectTags.module.css";
import { getVisibleTagCount } from "./MultiSelectTags.utils";

type SelectedItem = ComboBoxState<unknown, "multiple">["selectedItems"][number];

/** A committed layout decision, and the selection it was made for. */
interface Measured {
  /** How many tags to render before the counter. */
  count: number;
  /** The selected keys this count was computed from. */
  signature: string;
}

/** Width the field spends on everything that is not a tag. */
interface FieldReserve {
  /** The field's flex gap. */
  gap: number;
  /** Search input floor + toggle button + the gaps around them. */
  reserved: number;
}

const px = (value: string): number => Number.parseFloat(value) || 0;

const getSignature = (items: SelectedItem[]): string =>
  items.map((item) => String(item.key)).join("\u0000");

/**
 * Measures the parts of the field that hold a constant width for a given size:
 * the search input's `min-width` floor, the toggle button, and the gaps. Read
 * once and cached, because `getComputedStyle` is the expensive call here and
 * none of these change while the field is mounted at a given size.
 */
const readFieldReserve = (field: HTMLElement): FieldReserve => {
  const gap = px(getComputedStyle(field).columnGap);
  const input = field.querySelector("input");
  const inputFloor = input ? px(getComputedStyle(input).minWidth) : 0;
  const toggle = field.querySelector<HTMLElement>(".field-Button");
  return { gap, reserved: inputFloor + (toggle?.offsetWidth ?? 0) + gap * 2 };
};

/**
 * The field's content-box width, read synchronously. Only used for the first
 * measurement — after that the ResizeObserver supplies the same number without
 * touching the DOM.
 */
const readFieldContentWidth = (field: HTMLElement): number => {
  const style = getComputedStyle(field);
  return (
    field.clientWidth -
    px(style.paddingInlineStart) -
    px(style.paddingInlineEnd)
  );
};

export interface MultiSelectTagsProps {
  /**
   * The field size the tags sit in. At `"sm"` and `"md"` the tags that do not
   * fit collapse into a "+N" counter; at `"lg"` they all render and wrap.
   */
  size?: FieldSize;
}

/**
 * Renders the MultiSelect's selected items as removable tag chips. Reads the
 * selection from the surrounding ComboBox state, so it must be rendered
 * inside a MultiSelect.
 *
 * At `sm` and `md` the field is a single fixed-height row, so only the tags
 * that genuinely fit are rendered and the rest collapse into a "+N" counter.
 * That count is measured rather than configured:
 */
export function MultiSelectTags({
  size = DEFAULT_FIELD_SIZE,
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

  // lg wraps and grows to fit the whole selection, so nothing ever collapses.
  const collapses = size !== "lg";

  const tagsRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLElement | null>(null);
  /** Natural tag width per item key. A label's width does not change, so each
   *  is measured once however often the field is later resized. */
  const widthsRef = useRef(new Map<Key, number>());
  const counterWidthRef = useRef(0);
  const reserveRef = useRef<FieldReserve | null>(null);
  const contentWidthRef = useRef(0);
  const signatureRef = useRef("");
  const tagKeysRef = useRef<Key[]>([]);
  /** Mirrors `measured` so the ResizeObserver callback never reads a stale
   *  value through its closure. State drives rendering; this only guards the
   *  update. */
  const measuredRef = useRef<Measured | null>(null);
  /** The size the cached measurements were taken at. */
  const measuredSizeRef = useRef(size);
  const [measured, setMeasured] = useState<Measured | null>(null);

  // `.tags` is display:contents, so it has no box of its own to observe. Its
  // DOM parent is the field, whose width comes from the parent component and
  // never from this subtree — which is what makes it safe to observe.
  //
  // The field is tracked in state as well as in a ref, and both are load
  // bearing. Nothing renders here until something is selected, so on a field
  // that starts empty this subtree mounts with no DOM node at all, and a ref
  // filling in later does not re-run the subscription effect — the state is
  // what gets the observer attached to a field that appears after mount. The
  // ref is what the layout effect below reads, because it needs the element in
  // the same commit the callback ref ran in, not on the render after.
  const [fieldElement, setFieldElement] = useState<HTMLElement | null>(null);
  const setTagsRef = useCallback((element: HTMLDivElement | null) => {
    const field = element?.parentElement ?? null;
    tagsRef.current = element;
    fieldRef.current = field;
    setFieldElement(field);
  }, []);

  /**
   * Recomputes the fitted count from cached numbers and commits it only when
   * something actually changed. This guard is what keeps a resize cheap:
   * dragging a sidebar fires a ResizeObserver notification per frame but steps
   * the count once or twice, so all but a couple of those notifications end
   * here having done nothing but arithmetic over a handful of cached widths.
   * Debouncing instead would trade that for visible lag
   */
  const commit = useCallback(() => {
    const reserve = reserveRef.current;
    const keys = signatureRef.current;
    const tagKeys = tagKeysRef.current;
    // A tag whose width is still unknown must not be collapsed away: it would
    // then never be rendered, so it could never be measured, and the field
    // would settle on a count derived from a width of zero. Showing everything
    // is also what makes the next pass able to measure it.
    const measurable =
      collapses && tagKeys.every((key) => widthsRef.current.has(key));
    const count = measurable
      ? getVisibleTagCount({
          tagWidths: tagKeys.map((key) => widthsRef.current.get(key) ?? 0),
          availableWidth: contentWidthRef.current - (reserve?.reserved ?? 0),
          gap: reserve?.gap ?? 0,
          counterWidth: counterWidthRef.current,
        })
      : tagKeys.length;

    const previous = measuredRef.current;
    if (previous?.count === count && previous.signature === keys) return;

    const next = { count, signature: keys };
    measuredRef.current = next;
    setMeasured(next);
  }, [collapses]);

  useResizeObserver(
    fieldElement,
    useCallback(
      ({ inlineSize }: ResizeObserverSize) => {
        contentWidthRef.current = inlineSize;
        commit();
      },
      [commit]
    )
  );

  const total = selectedItems.length;
  const signature = getSignature(selectedItems);
  // A tag that has never been rendered has no measured width, and it cannot be
  // measured unless this render puts it in the DOM. So a selection this
  // component has not laid out yet renders in full for one prepaint commit,
  // then collapses. Already measured selections skip the pass entirely.
  const isMeasuring = collapses && measured?.signature !== signature;
  const visible =
    isMeasuring || !measured ? total : Math.min(measured.count, total);
  const hiddenCount = total - visible;

  useLayoutEffect(() => {
    const tags = tagsRef.current;
    const field = fieldRef.current;
    if (!tags || !field) return;

    signatureRef.current = signature;
    tagKeysRef.current = selectedItems.map((item) => item.key);

    // React Aria resolves a collection in a later commit than the one that
    // renders it, so the first pass after a selection change finds a TagList
    // that is still empty. Harvesting on every pass rather than on a flagged
    // "measuring" one is what makes that timing a non-issue: the pass that
    // finds the tags is the pass that measures them. The guard keeps the
    // steady state to one `every` over a handful of keys.
    const unmeasured = selectedItems.some(
      (item) => !widthsRef.current.has(item.key)
    );
    if (unmeasured) {
      // Only the rendered prefix of the selection is in the DOM, and it is in
      // selection order, so index maps to item. These reads happen in one
      // batch, before anything is written back.
      const elements = tags.querySelectorAll<HTMLElement>(".react-aria-Tag");
      selectedItems.forEach((item, index) => {
        const element = elements[index];
        if (element) widthsRef.current.set(item.key, element.offsetWidth);
      });
    }
    if (counterWidthRef.current === 0) {
      const probe = tags.querySelector<HTMLElement>(`.${styles.counterProbe}`);
      if (probe) counterWidthRef.current = probe.offsetWidth;
    }

    reserveRef.current ??= readFieldReserve(field);
    if (contentWidthRef.current === 0) {
      // Only on the very first pass. Waiting for the ResizeObserver instead
      // would paint every tag once and then snap to the fitted count.
      contentWidthRef.current = readFieldContentWidth(field);
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
    if (measuredSizeRef.current === size) return;
    measuredSizeRef.current = size;
    widthsRef.current.clear();
    counterWidthRef.current = 0;
    reserveRef.current = null;
    contentWidthRef.current = 0;
    measuredRef.current = null;
    setMeasured(null);
  }, [size]);

  if (total === 0) {
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
      {hiddenCount > 0 && (
        <span className={styles.counter}>
          <span aria-hidden="true">+{hiddenCount}</span>
          {/* The tag list only names the tags it renders, so without this a
              screen reader would report the selection as smaller than it is. */}
          <VisuallyHidden>{hiddenCount} more selected</VisuallyHidden>
        </span>
      )}
      {collapses && total > 1 && (
        // Out of flow so it can be measured without being seen, and carrying
        // the widest label this selection could produce, so the room reserved
        // for the counter is never short of what the counter goes on to need.
        // Kept mounted rather than rendered only while measuring: it costs no
        // layout, and the alternative is a counter whose width can only be
        // read on a pass where the counter is not the thing being decided.
        <span
          aria-hidden="true"
          className={clsx(styles.counter, styles.counterProbe)}
        >
          +{total - 1}
        </span>
      )}
    </div>
  );
}
