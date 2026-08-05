/**
 * The widths the full-width lines of a paragraph alternate between. Real prose
 * does not break at the same column twice, so a paragraph of identical bars
 * reads as a table rather than as text; a couple of percent of ragging is
 * enough to sell it.
 */
const LINE_WIDTHS = ["100%", "92%"];

/**
 * The last line of a paragraph, which stops wherever the sentence ended. This
 * is the shape that tells the reader they are looking at a block of text.
 */
const LAST_LINE_WIDTH = "68%";

/** One line of a paragraph skeleton: how wide to draw it, and a key for it. */
export interface ParagraphLine {
  /** Stable key for the line, which has nothing but its position to be identified by. */
  id: string;
  /** The width of the line, as a CSS length. */
  width: string;
}

/** A line count that cannot produce a paragraph renders nothing rather than throwing. */
const normalizeLineCount = (lines: number): number =>
  Number.isFinite(lines) ? Math.max(0, Math.floor(lines)) : 0;

/**
 * The lines of a paragraph skeleton, ragged the way a paragraph of text is:
 * full-width lines alternating between two lengths, and a short last line. A
 * single line is the exception — with nothing above it to be short against, it
 * runs the full width.
 */
export const getParagraphLines = (lines: number): ParagraphLine[] => {
  const count = normalizeLineCount(lines);

  if (count === 1) {
    return [{ id: "line-0", width: LINE_WIDTHS[0] }];
  }

  return Array.from({ length: count }, (_, index) => ({
    id: `line-${index}`,
    width:
      index === count - 1
        ? LAST_LINE_WIDTH
        : LINE_WIDTHS[index % LINE_WIDTHS.length],
  }));
};
