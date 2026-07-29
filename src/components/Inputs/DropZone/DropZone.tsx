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
   * Size of the drop zone: 48px, 72px, or 96px minimum height.
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
