"use client";
import clsx from "clsx";
import utils from "../../styles/utilities.module.css";
import styles from "./CheckboxIndicator.module.css";

export interface CheckboxIndicatorProps {
  /** Renders the indeterminate (dash) mark instead of a checkmark. */
  isIndeterminate?: boolean;
}

/**
 * The presentational checkbox box and checkmark. It reflects the selected,
 * indeterminate, and disabled state of its nearest ancestor carrying the
 * matching `data-*` attribute (e.g. a `CheckboxButton` or a selectable
 * `ListBoxItem`), so the same checkbox visual can be reused anywhere without
 * an interactive input of its own.
 */
export function CheckboxIndicator({ isIndeterminate }: CheckboxIndicatorProps) {
  return (
    <div className={clsx("indicator", utils.indicator, styles.indicator)}>
      <svg
        viewBox="0 0 18 18"
        aria-hidden="true"
        key={isIndeterminate ? "indeterminate" : "check"}
      >
        {isIndeterminate ? (
          <rect x={1} y={7.5} width={16} height={3} />
        ) : (
          <polyline points="2 9 7 14 16 4" />
        )}
      </svg>
    </div>
  );
}
