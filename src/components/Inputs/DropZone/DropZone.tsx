"use client";
import clsx from "clsx";
import {
  DropZone as AriaDropZone,
  type DropZoneProps as AriaDropZoneProps,
  Text,
} from "react-aria-components/DropZone";
import {
  DEFAULT_FIELD_SIZE,
  type FieldSize,
} from "@/components/Inputs/FormComponents/index";
import styles from "./DropZone.module.css";

export interface DropZoneProps extends AriaDropZoneProps {
  /**
   * The size of the drop zone, scaling its text, radius, block padding, and
   * minimum height: `"sm"` is a compact target with 12px text, 8px of block
   * padding, and a 48px minimum height; `"md"` (the default) has 14px text,
   * 16px of block padding, and a 72px minimum height; `"lg"` is the roomy
   * target with 16px text, 24px of block padding, and a 96px minimum height.
   * The minimum sizes the content box, so an empty target renders 66px, 106px,
   * or 146px tall once its padding and border are counted. A DropZone follows
   * the field scale, so one inside a `<Form size="sm">` becomes compact along
   * with the fields around it. Being a box target rather than a single-line
   * control, it never shares a row height with a TextField or Select.
   *
   * @default 'md'
   */
  size?: FieldSize;
}

export function DropZone({
  size = DEFAULT_FIELD_SIZE,
  ...props
}: DropZoneProps) {
  return (
    <AriaDropZone
      {...props}
      data-field-size={size}
      className={clsx("react-aria-DropZone", styles.dropZone, props.className)}
    />
  );
}

export { Text };
