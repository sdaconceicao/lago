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
   * The size of the drop zone. `"sm"` renders a compact target with 12px text,
   * tighter padding, and a smaller minimum height; `"md"` (the default) renders
   * the roomier target. A DropZone follows the field scale, so one inside a
   * `<Form size="sm">` becomes compact along with the fields around it. Being a
   * box target rather than a single-line control, it never shares a row height
   * with a TextField or Select.
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
