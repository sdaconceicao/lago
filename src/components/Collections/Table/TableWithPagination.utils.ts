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
