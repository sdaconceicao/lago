"use client";
import clsx from "clsx";
import { type HTMLAttributes, useMemo } from "react";
import { Skeleton } from "../Skeleton";
import {
  DEFAULT_PARAGRAPH_LINES,
  DEFAULT_SKELETON_EDGES,
  type SkeletonEdges,
  type SkeletonLength,
} from "../Skeleton.types";
import { getSkeletonA11yProps, toCssLength } from "../Skeleton.utils";
import styles from "./SkeletonParagraph.module.css";
import { getParagraphLines } from "./SkeletonParagraph.utils";

/**
 * Props for the SkeletonParagraph component
 */
export interface SkeletonParagraphProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * How many lines the paragraph is drawn with. The last one is short, the
   * rest alternate between two near-full widths, so the block rags like text.
   *
   * @default 3
   */
  lines?: number;
  /**
   * Whether the ends of each line are rounded or square. `round` draws a pill;
   * `straight` cuts the ends off.
   *
   * @default 'round'
   */
  edges?: SkeletonEdges;
  /**
   * The width of the paragraph, which the line widths are measured against. A
   * number is read as pixels; a string is used as given. Defaults to the full
   * width of the container.
   */
  width?: SkeletonLength;
  /**
   * The height of each line. A number is read as pixels; a string is used as
   * given. Defaults to one line of the inherited font size, so a paragraph
   * standing in for larger type only needs that type size set on it.
   */
  lineHeight?: SkeletonLength;
  /**
   * Accessible name for the placeholder, which also makes it announce as a
   * status. Skeletons are hidden from assistive technology by default; name
   * the one that stands for the whole loading region and leave the rest
   * silent.
   */
  label?: string;
  /** CSS class name for custom styling. Merged with the component's default classes. */
  className?: string;
}

/**
 * A placeholder for a block of text: three lines by default, the last one
 * short, ragged so it reads as prose rather than as a stack of bars.
 *
 * Use it wherever copy of roughly known length is loading — a description, a
 * comment, a summary. For a single line, such as a heading, a plain
 * `<Skeleton variant="line" />` is enough.
 */
export function SkeletonParagraph({
  lines = DEFAULT_PARAGRAPH_LINES,
  edges = DEFAULT_SKELETON_EDGES,
  width,
  lineHeight,
  label,
  className,
  style,
  "aria-label": ariaLabel,
  ...props
}: SkeletonParagraphProps) {
  const paragraphLines = useMemo(() => getParagraphLines(lines), [lines]);

  return (
    <div
      {...props}
      {...getSkeletonA11yProps(label ?? ariaLabel)}
      className={clsx("skeleton-paragraph", styles.paragraph, className)}
      style={{ width: toCssLength(width), ...style }}
    >
      {paragraphLines.map((line) => (
        <Skeleton
          key={line.id}
          variant="line"
          edges={edges}
          width={line.width}
          height={lineHeight}
        />
      ))}
    </div>
  );
}
