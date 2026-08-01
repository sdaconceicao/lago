"use client";
import clsx from "clsx";
import type { HTMLAttributes } from "react";
import {
  SkeletonCard,
  type SkeletonCardProps,
} from "./BaseComponents/SkeletonCard";
import {
  SkeletonParagraph,
  type SkeletonParagraphProps,
} from "./BaseComponents/SkeletonParagraph";
import styles from "./Skeleton.module.css";
import {
  DEFAULT_SKELETON_EDGES,
  DEFAULT_SKELETON_VARIANT,
  type SkeletonEdges,
  type SkeletonLength,
  type SkeletonVariant,
} from "./Skeleton.types";
import { getSkeletonA11yProps, toCssLength } from "./Skeleton.utils";

/**
 * Props for the Skeleton component
 */
export interface SkeletonProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * The shape drawn: `box` for a block of content such as an image or a chart,
   * `circle` for an avatar or an icon, `line` for a single line of text.
   *
   * @default 'box'
   */
  variant?: SkeletonVariant;
  /**
   * Whether the corners are rounded or square. `round` uses the theme radius —
   * a pill for a line — and `straight` cuts the corners off. Ignored by
   * `circle`, which is always fully round.
   *
   * @default 'round'
   */
  edges?: SkeletonEdges;
  /**
   * The width of the shape. A number is read as pixels; a string is used as
   * given, so `"60%"` or `"12rem"` both work. Defaults to the full width of
   * the container for a box or a line, and to 36px for a circle — the diameter
   * of an md avatar.
   */
  width?: SkeletonLength;
  /**
   * The height of the shape. A number is read as pixels; a string is used as
   * given. Defaults to 120px for a box, to one line of the inherited font size
   * for a line, and to the width for a circle, which keeps it round.
   */
  height?: SkeletonLength;
  /**
   * Accessible name for the placeholder, which also makes it announce as a
   * status. Skeletons are decorative and hidden from assistive technology by
   * default, because a region drawn as a dozen shapes should not be read out a
   * dozen times — so name the one skeleton that stands for the whole region
   * ("Loading your invoices") and leave the rest silent.
   */
  label?: string;
  /** CSS class name for custom styling. Merged with the component's default classes. */
  className?: string;
}

/**
 * A placeholder in the shape of the content that is still loading, shimmering
 * until it arrives.
 *
 * Reach for a skeleton over a Spinner when you know what the content will look
 * like and roughly how much room it needs: holding the shape of the page keeps
 * the layout from jumping as each piece lands, and reads as faster than an
 * empty region with a spinner in the middle of it. Use a Spinner where the
 * shape is unknown, or the wait is too short to be worth drawing.
 *
 * Compose the three shapes to match the layout being replaced, or use
 * `Skeleton.Paragraph` and `Skeleton.Card` for the two arrangements that come
 * up most.
 */
export function Skeleton({
  variant = DEFAULT_SKELETON_VARIANT,
  edges = DEFAULT_SKELETON_EDGES,
  width,
  height,
  label,
  className,
  style,
  "aria-label": ariaLabel,
  ...props
}: SkeletonProps) {
  return (
    <span
      {...props}
      // An `aria-label` passed straight through means the same thing as
      // `label`, so let it name the skeleton rather than leaving it hidden.
      {...getSkeletonA11yProps(label ?? ariaLabel)}
      className={clsx("skeleton", styles.skeleton, className)}
      data-variant={variant}
      data-edges={edges}
      style={{
        width: toCssLength(width),
        height: toCssLength(height),
        ...style,
      }}
    />
  );
}

Skeleton.Paragraph = SkeletonParagraph;
Skeleton.Card = SkeletonCard;

export type {
  SkeletonCardProps,
  SkeletonEdges,
  SkeletonLength,
  SkeletonParagraphProps,
  SkeletonVariant,
};
export { SkeletonCard, SkeletonParagraph };
