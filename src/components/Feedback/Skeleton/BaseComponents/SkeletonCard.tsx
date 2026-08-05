"use client";
import clsx from "clsx";
import type { HTMLAttributes } from "react";
import { Skeleton } from "../Skeleton";
import {
  DEFAULT_SKELETON_EDGES,
  type SkeletonEdges,
  type SkeletonLength,
} from "../Skeleton.types";
import { getSkeletonA11yProps, toCssLength } from "../Skeleton.utils";
import styles from "./SkeletonCard.module.css";

/**
 * Props for the SkeletonCard component
 */
export interface SkeletonCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Whether the corners of the box and the ends of the line are rounded or
   * square.
   *
   * @default 'round'
   */
  edges?: SkeletonEdges;
  /**
   * The width of the card. A number is read as pixels; a string is used as
   * given. Defaults to the full width of the container.
   */
  width?: SkeletonLength;
  /**
   * The height of the box above the line. A number is read as pixels; a string
   * is used as given. Defaults to 120px, the height of a plain box skeleton.
   */
  height?: SkeletonLength;
  /**
   * The height of the line below the box. A number is read as pixels; a string
   * is used as given. Defaults to one line of the inherited font size.
   */
  lineHeight?: SkeletonLength;
  /**
   * Accessible name for the placeholder, which also makes it announce as a
   * status. Skeletons are hidden from assistive technology by default; a grid
   * of loading cards should name one of them, not every one.
   */
  label?: string;
  /** CSS class name for custom styling. Merged with the component's default classes. */
  className?: string;
}

/**
 * A placeholder for a card: a box with a line under it, standing in for the
 * media and the title beneath it.
 *
 * Use it for the tiles of a grid or the rows of a feed while they load —
 * repeat one per item you expect, so the grid is already the right size when
 * the real cards replace it. Where the card carries a paragraph of copy rather
 * than a single title, compose `Skeleton` and `Skeleton.Paragraph` instead.
 */
export function SkeletonCard({
  edges = DEFAULT_SKELETON_EDGES,
  width,
  height,
  lineHeight,
  label,
  className,
  style,
  "aria-label": ariaLabel,
  ...props
}: SkeletonCardProps) {
  return (
    <div
      {...props}
      {...getSkeletonA11yProps(label ?? ariaLabel)}
      className={clsx("skeleton-card", styles.card, className)}
      style={{ width: toCssLength(width), ...style }}
    >
      <Skeleton variant="box" edges={edges} height={height} />
      <Skeleton variant="line" edges={edges} height={lineHeight} />
    </div>
  );
}
