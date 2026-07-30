"use client";
import clsx from "clsx";
import { type CSSProperties, useId } from "react";
import {
  ProgressCircle,
  type ProgressCircleProps,
} from "@/components/Feedback/ProgressCircle/ProgressCircle";
import {
  DEFAULT_FIELD_SIZE,
  type FieldSize,
} from "@/components/Inputs/FormComponents/index";
import styles from "./Spinner.module.css";

/**
 * Circle diameter for each step of the shared field scale. A spinner sits above
 * its caption rather than inside a field, so it steps in 8px increments: 16px
 * matches an icon beside `sm` text, and 32px still reads from across a page.
 */
const SPINNER_SIZE: Record<FieldSize, number> = { sm: 16, md: 24, lg: 32 };

/** Accessible name used when there is no visible label to borrow one from. */
const DEFAULT_ARIA_LABEL = "Loading";

export interface SpinnerProps
  extends Omit<
    ProgressCircleProps,
    | "children"
    | "className"
    | "formatOptions"
    | "isIndeterminate"
    | "label"
    | "maxValue"
    | "minValue"
    | "size"
    | "style"
    | "value"
    | "valueLabel"
  > {
  /**
   * Text rendered below the circle, centered under it. Naming what is loading
   * ("Loading invoices…") reads better than a bare spinner, and the text
   * becomes the spinner's accessible name. Omit it for a circle on its own —
   * assistive technology then falls back to `aria-label`, or to "Loading".
   */
  label?: string;
  /**
   * The size variant, on the shared field scale. Sets the circle diameter —
   * "sm" 16px, "md" (the default) 24px, "lg" 32px — and scopes the caption to
   * that step's font size and label gap.
   */
  size?: FieldSize;
  /** CSS class name for custom styling. Merged with the component's own classes. */
  className?: string;
  /** Inline styles applied to the root element. */
  style?: CSSProperties;
}

/**
 * An indeterminate loading spinner with an optional label below it. Reach for it
 * while work of unknown length is in flight — a page hydrating, a query running,
 * a file uploading with no progress to report. When the work does report
 * progress, use ProgressBar or ProgressCircle instead, so the user can see how
 * far along it is.
 *
 * The circle is a ProgressCircle in its indeterminate state, so it carries that
 * component's track, arc, and continuous spin, and announces itself as a busy
 * progressbar rather than as a value.
 */
export function Spinner({
  label,
  size = DEFAULT_FIELD_SIZE,
  className,
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: SpinnerProps) {
  const labelId = useId();
  const hasLabel = Boolean(label);

  return (
    <div
      className={clsx(styles.spinner, className)}
      style={style}
      data-field-size={size}
    >
      <ProgressCircle
        {...props}
        isIndeterminate
        size={SPINNER_SIZE[size]}
        // A visible label is the better accessible name, so point at it and
        // leave `aria-label` for the circle-only case. An explicit prop still
        // wins, for a fuller name than the caption can carry.
        aria-label={ariaLabel ?? (hasLabel ? undefined : DEFAULT_ARIA_LABEL)}
        aria-labelledby={ariaLabelledBy ?? (hasLabel ? labelId : undefined)}
      />
      {hasLabel && (
        <span className={styles.label} id={labelId}>
          {label}
        </span>
      )}
    </div>
  );
}
