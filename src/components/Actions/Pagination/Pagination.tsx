"use client";
import { useMemo } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "react-aria-components/Button";
import utils from "@/styles/utilities.module.css";
import { getPaginationRange } from "./Pagination.utils";
import styles from "./Pagination.module.css";

/**
 * Props for the Pagination component.
 */
export interface PaginationProps {
  /** The currently active page, 1-based. */
  page: number;
  /** Total number of pages available. Values below 1 render nothing. */
  totalPages: number;
  /** Called with the requested page number when the user navigates. */
  onPageChange: (page: number) => void;
  /** Number of page buttons shown on each side of the active page. @default 1 */
  siblingCount?: number;
  /** Number of page buttons always shown at the start and end. @default 1 */
  boundaryCount?: number;
  /** Hides the Previous and Next controls when true. @default false */
  hidePrevNext?: boolean;
  /** Accessible label for the surrounding navigation landmark. @default "Pagination" */
  "aria-label"?: string;
  /** CSS class name merged with the component's default classes. */
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  hidePrevNext = false,
  "aria-label": ariaLabel = "Pagination",
  className,
}: PaginationProps) {
  const items = useMemo(
    () => getPaginationRange({ page, totalPages, siblingCount, boundaryCount }),
    [page, totalPages, siblingCount, boundaryCount]
  );

  if (totalPages < 1) return null;

  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <nav
      aria-label={ariaLabel}
      className={clsx("pagination", styles.pagination, className)}
    >
      <ul className={clsx("pagination-list", styles.list)}>
        {!hidePrevNext && (
          <li>
            <Button
              className={clsx(
                "react-aria-Button",
                utils.buttonBase,
                styles.control
              )}
              data-variant="quiet"
              aria-label="Go to previous page"
              isDisabled={isFirstPage}
              onPress={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </Button>
          </li>
        )}

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <li
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className={clsx("pagination-ellipsis", styles.ellipsis)}
            >
              &#8230;
            </li>
          ) : (
            <li key={item}>
              <Button
                className={clsx(
                  "react-aria-Button",
                  utils.buttonBase,
                  styles.page
                )}
                data-variant="quiet"
                data-selected={item === page || undefined}
                aria-label={`Go to page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onPress={() => onPageChange(item)}
              >
                {item}
              </Button>
            </li>
          )
        )}

        {!hidePrevNext && (
          <li>
            <Button
              className={clsx(
                "react-aria-Button",
                utils.buttonBase,
                styles.control
              )}
              data-variant="quiet"
              aria-label="Go to next page"
              isDisabled={isLastPage}
              onPress={() => onPageChange(page + 1)}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </Button>
          </li>
        )}
      </ul>
    </nav>
  );
}
