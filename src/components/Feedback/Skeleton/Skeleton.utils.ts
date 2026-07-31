import type { SkeletonLength } from "./Skeleton.types";

/**
 * The accessibility props a skeleton root carries. A skeleton is a placeholder
 * for content that has not arrived, so it is one of the two: named, and
 * announced as a status; or silent, and skipped entirely.
 */
export type SkeletonA11yProps =
  | { role: "status"; "aria-label": string }
  | { "aria-hidden": true };

/**
 * Resolves a sizing prop to a CSS length. A bare number is read as pixels,
 * which is what a caller passing `width={120}` means; a string is passed
 * through untouched, so percentages, `rem`, `ch` and `calc()` all work.
 */
export const toCssLength = (value?: SkeletonLength): string | undefined =>
  typeof value === "number" ? `${value}px` : value;

/**
 * Decides how a skeleton presents itself to assistive technology.
 *
 * A loading region is usually drawn as several skeletons at once, and a screen
 * reader reading "loading" once per shape is noise, so an unnamed skeleton is
 * hidden outright. Naming one — the region as a whole, rather than each shape
 * in it — turns that one into a status, so the wait is announced exactly once.
 */
export const getSkeletonA11yProps = (label?: string): SkeletonA11yProps =>
  label ? { role: "status", "aria-label": label } : { "aria-hidden": true };
