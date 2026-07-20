/** A rendered pagination item: either a page number or a truncation gap. */
export type PaginationItem = number | "ellipsis";

/**
 * Inclusive integer range helper. Returns `[]` when `end < start`.
 */
export const range = (start: number, end: number): number[] => {
  const length = end - start + 1;
  return length > 0 ? Array.from({ length }, (_, i) => start + i) : [];
};

/**
 * Clamps a 1-based page number into the valid `[1, totalPages]` window.
 * Returns 1 when there are no pages so callers always have a usable value.
 */
export const clampPage = (page: number, totalPages: number): number => {
  if (totalPages <= 0) return 1;
  if (page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
};

interface PaginationRangeOptions {
  /** The currently active page (1-based). */
  page: number;
  /** Total number of pages available. */
  totalPages: number;
  /** Page buttons shown on each side of the active page. */
  siblingCount?: number;
  /** Page buttons always shown at the very start and end. */
  boundaryCount?: number;
}

/**
 * Builds the sequence of page numbers and ellipsis gaps to render, following
 * the standard truncation rule: always show the boundary pages, the pages
 * immediately around the current page, and collapse everything else into
 * ellipses. The result never contains two adjacent numbers replaced by an
 * ellipsis that only hides a single page — in that case the page is shown.
 */
export const getPaginationRange = ({
  page,
  totalPages,
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationRangeOptions): PaginationItem[] => {
  if (totalPages <= 0) return [];

  const safeBoundary = Math.max(0, boundaryCount);
  const safeSibling = Math.max(0, siblingCount);
  const current = clampPage(page, totalPages);

  // If every page fits without truncation, list them all.
  const totalSlots = safeBoundary * 2 + safeSibling * 2 + 3;
  if (totalPages <= totalSlots) {
    return range(1, totalPages);
  }

  const startPages = range(1, safeBoundary);
  const endPages = range(totalPages - safeBoundary + 1, totalPages);

  const siblingsStart = Math.max(
    Math.min(
      current - safeSibling,
      totalPages - safeBoundary - safeSibling * 2 - 1
    ),
    safeBoundary + 2
  );
  const siblingsEnd = Math.min(
    Math.max(current + safeSibling, safeBoundary + safeSibling * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : totalPages - 1
  );

  return [
    ...startPages,
    // Show the page directly after the boundary instead of an ellipsis when
    // the ellipsis would only be hiding that single page.
    ...(siblingsStart > safeBoundary + 2
      ? (["ellipsis"] as PaginationItem[])
      : safeBoundary + 1 <= totalPages - safeBoundary
        ? [safeBoundary + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < totalPages - safeBoundary - 1
      ? (["ellipsis"] as PaginationItem[])
      : totalPages - safeBoundary >= safeBoundary + 1
        ? [totalPages - safeBoundary]
        : []),
    ...endPages,
  ];
};
