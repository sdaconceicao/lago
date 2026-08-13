export interface VisibleTagCountOptions {
  /** Natural rendered width of each tag, in source order. */
  tagWidths: number[];
  /** Room the tags have to share, in px. Non-positive means "not measured yet". */
  availableWidth: number;
  /** Flex gap between adjacent tags, in px. */
  gap: number;
  /** Natural rendered width of the "+N" counter chip, in px. */
  counterWidth: number;
}

/**
 * Total width of the first `count` tags laid out in a row, gaps included.
 */
const rowWidth = (tagWidths: number[], count: number, gap: number): number => {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += tagWidths[i] + (i > 0 ? gap : 0);
  }
  return total;
};

/**
 * How many tags to render before collapsing the rest into a "+N" counter.
 *
 * The whole selection is shown whenever it fits; otherwise room is reserved for
 * the counter and as many whole tags as still fit go in front of it. A tag is
 * never rendered at less than its natural width — a half-width chip reads as a
 * rendering bug, and its remove button is the first thing to be squeezed out.
 *
 * Two boundary cases matter:
 *
 * - `availableWidth <= 0` means nothing has been measured yet: during SSR, in
 *   jsdom, or on the first client render before the layout effect runs. Show
 *   everything. The alternative — showing one tag and a counter — would be a
 *   visible correction on hydration, and would make the server render depend on
 *   a viewport the server cannot see.
 * - When not even the first tag fits alongside the counter, return 1 anyway.
 *   One ellipsised tag plus "+4" tells the reader far more than a bare "+5".
 */
export const getVisibleTagCount = ({
  tagWidths,
  availableWidth,
  gap,
  counterWidth,
}: VisibleTagCountOptions): number => {
  if (tagWidths.length === 0) return 0;
  if (availableWidth <= 0) return tagWidths.length;

  if (rowWidth(tagWidths, tagWidths.length, gap) <= availableWidth) {
    return tagWidths.length;
  }

  // Everything from here on shares the row with the counter.
  const widthForTags = availableWidth - counterWidth - gap;

  let used = 0;
  let count = 0;
  for (const width of tagWidths) {
    const next = used + width + (count > 0 ? gap : 0);
    if (next > widthForTags) break;
    used = next;
    count++;
  }

  return Math.max(1, count);
};
