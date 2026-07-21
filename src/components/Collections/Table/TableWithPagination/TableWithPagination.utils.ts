/**
 * Number of pages needed to display `total` items at `rowsPerPage` per page.
 * Returns 0 when there are no items, and treats a non-positive `rowsPerPage`
 * as "everything on one page" so callers never divide by zero.
 */
export const getPageCount = (total: number, rowsPerPage: number): number => {
  if (total <= 0) return 0;
  if (rowsPerPage <= 0) return 1;
  return Math.ceil(total / rowsPerPage);
};

/**
 * Returns the slice of `items` visible on the given 1-based `page`. A
 * non-positive `rowsPerPage` returns the full list. Pages outside the valid
 * range yield an empty slice rather than throwing.
 */
export const paginate = <T>(
  items: T[],
  page: number,
  rowsPerPage: number
): T[] => {
  if (rowsPerPage <= 0) return items;
  const start = (page - 1) * rowsPerPage;
  if (start < 0) return [];
  return items.slice(start, start + rowsPerPage);
};

/** The 1-based range of results shown on a page: `from`, `to`, and `total`. */
export interface ResultsRange {
  /** Index of the first visible result (1-based). 0 when there are none. */
  from: number;
  /** Index of the last visible result (1-based). 0 when there are none. */
  to: number;
  /** Total number of results across every page. */
  total: number;
}

/**
 * Computes the 1-based `from`/`to`/`total` range of results shown on the given
 * page. Returns a zeroed range when there are no results. A non-positive
 * `rowsPerPage` is treated as "everything on one page". Assumes `page` is
 * already within range; a page past the end still clamps to `total`.
 */
export const getResultsRange = (
  page: number,
  rowsPerPage: number,
  total: number
): ResultsRange => {
  if (total <= 0) return { from: 0, to: 0, total: 0 };
  if (rowsPerPage <= 0) return { from: 1, to: total, total };

  const from = (page - 1) * rowsPerPage + 1;
  if (from > total) return { from: total, to: total, total };
  const to = Math.min(page * rowsPerPage, total);
  return { from, to, total };
};
