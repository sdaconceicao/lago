"use client";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { type TableProps } from "react-aria-components/Table";
import { Pagination } from "@/components/Actions/Pagination/Pagination";
import { clampPage } from "@/components/Actions/Pagination/Pagination.utils";
import {
  ResultsCount,
  type ResultsCountInfo,
} from "../BaseComponents/ResultsCount/ResultsCount";
import { Table } from "../Table";
import {
  getPageCount,
  getResultsRange,
  paginate,
} from "./TableWithPagination.utils";
import styles from "./TableWithPagination.module.css";

export interface TableWithPaginationProps<T> extends Omit<
  TableProps,
  "children"
> {
  /** The full, unpaginated set of rows. Slicing is handled internally. */
  items: T[];
  /**
   * Renders the table's content — the TableHeader/Column and TableBody/Row/Cell
   * are still composed here. Receives the slice of items visible on the active
   * page, which should be passed to the TableBody's `items` prop.
   */
  children: (pageItems: T[]) => ReactNode;
  /** Number of rows shown per page. @default 10 */
  rowsPerPage?: number;
  /** The active page (1-based) for controlled usage. */
  page?: number;
  /** The initial page (1-based) for uncontrolled usage. @default 1 */
  defaultPage?: number;
  /** Called with the new page number whenever the active page changes. */
  onPageChange?: (page: number) => void;
  /** Page buttons shown on each side of the active page. @default 1 */
  siblingCount?: number;
  /** Page buttons always shown at the start and end. @default 1 */
  boundaryCount?: number;
  /** Hides the pagination control (useful when a single page fits). @default false */
  hidePagination?: boolean;
  /** Accessible label for the pagination navigation landmark. @default "Table pagination" */
  paginationLabel?: string;
  /** Hides the "Showing x to y of z results" summary in the footer. @default false */
  hideResults?: boolean;
  /**
   * Templates the results summary from the `{ from, to, total }` values.
   * Defaults to "Showing x to y of z results".
   */
  resultsTemplate?: (info: ResultsCountInfo) => ReactNode;
  /**
   * Constrains the table body's height. When set, the rows scroll within this
   * height while the column header stays pinned to the top and the footer
   * (results + pagination) stays fixed below. Accepts any CSS length or a
   * number of pixels.
   */
  maxHeight?: number | string;
}

export function TableWithPagination<T>({
  items,
  children,
  rowsPerPage = 10,
  page: controlledPage,
  defaultPage = 1,
  onPageChange,
  siblingCount,
  boundaryCount,
  hidePagination = false,
  paginationLabel = "Table pagination",
  hideResults = false,
  resultsTemplate,
  maxHeight,
  className,
  ...tableProps
}: TableWithPaginationProps<T>) {
  const [uncontrolledPage, setUncontrolledPage] = useState(defaultPage);
  const isControlled = controlledPage !== undefined;
  const rawPage = isControlled ? controlledPage : uncontrolledPage;

  const totalPages = getPageCount(items.length, rowsPerPage);
  const currentPage = clampPage(rawPage, totalPages);

  const pageItems = useMemo(
    () => paginate(items, currentPage, rowsPerPage),
    [items, currentPage, rowsPerPage]
  );

  const resultsRange = getResultsRange(currentPage, rowsPerPage, items.length);

  const handlePageChange = useCallback(
    (next: number) => {
      if (!isControlled) {
        setUncontrolledPage(next);
      }
      onPageChange?.(next);
    },
    [isControlled, onPageChange]
  );

  const showResults = !hideResults && items.length > 0;
  const showPagination = !hidePagination && totalPages > 1;
  const showFooter = showResults || showPagination;

  const table = <Table {...tableProps}>{children(pageItems)}</Table>;

  return (
    <div
      className={clsx(
        "table-with-pagination",
        styles.tableWithPagination,
        className
      )}
    >
      {maxHeight !== undefined ? (
        <div
          className={clsx("table-scroll", styles.scrollArea)}
          style={{ maxHeight }}
        >
          {table}
        </div>
      ) : (
        table
      )}

      {showFooter && (
        <div className={clsx("table-footer", styles.footer)}>
          <div className={clsx("table-footer-start", styles.footerStart)}>
            {showResults && (
              <ResultsCount
                from={resultsRange.from}
                to={resultsRange.to}
                total={resultsRange.total}
                template={resultsTemplate}
              />
            )}
          </div>
          {showPagination && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              siblingCount={siblingCount}
              boundaryCount={boundaryCount}
              aria-label={paginationLabel}
            />
          )}
        </div>
      )}
    </div>
  );
}
