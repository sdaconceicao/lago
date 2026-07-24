"use client";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ResultsCount.module.css";

/** The values passed to a results template: the visible range and the total. */
export interface ResultsCountInfo {
  /** Index of the first visible result (1-based). 0 when there are none. */
  from: number;
  /** Index of the last visible result (1-based). 0 when there are none. */
  to: number;
  /** Total number of results across every page. */
  total: number;
}

/**
 * Default results template: "Showing x to y of z results", or "No results"
 * when the list is empty. Uses locale-aware number formatting.
 */
export const defaultResultsTemplate = ({
  from,
  to,
  total,
}: ResultsCountInfo): ReactNode => {
  if (total <= 0) return "No results";
  const format = (value: number) => value.toLocaleString();
  return `Showing ${format(from)} to ${format(to)} of ${format(total)} results`;
};

export interface ResultsCountProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Index of the first visible result (1-based). */
  from: number;
  /** Index of the last visible result (1-based). */
  to: number;
  /** Total number of results across every page. */
  total: number;
  /**
   * Templates the rendered string from the `{ from, to, total }` values.
   * Defaults to "Showing x to y of z results". Return any ReactNode to fully
   * customise the output.
   */
  template?: (info: ResultsCountInfo) => ReactNode;
}

export function ResultsCount({
  from,
  to,
  total,
  template = defaultResultsTemplate,
  className,
  ...props
}: ResultsCountProps) {
  return (
    <p
      role="status"
      aria-live="polite"
      {...props}
      className={clsx("results-count", styles.resultsCount, className)}
    >
      {template({ from, to, total })}
    </p>
  );
}
