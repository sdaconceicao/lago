"use client";
import clsx from "clsx";
import {
  type DropZoneProps,
  DropZone as RACDropZone,
  Text,
} from "react-aria-components/DropZone";
import styles from "./DropZone.module.css";

export function DropZone(props: DropZoneProps) {
  return (
    <RACDropZone
      {...props}
      className={clsx("react-aria-DropZone", styles.dropZone, props.className)}
    />
  );
}

export { Text };
