"use client";
import clsx from "clsx";
import React from "react";
import {
  Separator as RACSeparator,
  type SeparatorProps,
} from "react-aria-components/Separator";
import styles from "./Separator.module.css";

export function Separator(props: SeparatorProps) {
  return (
    <RACSeparator
      {...props}
      className={
        props.className ?? clsx("react-aria-Separator", styles.separator)
      }
    />
  );
}
