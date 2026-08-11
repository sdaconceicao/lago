"use client";
import clsx from "clsx";
import type { TextProps } from "react-aria-components/Text";
import { SlottedText } from "@/components/Typography/Text/SlottedText";
import styles from "./Description.module.css";

export function Description(props: TextProps) {
  return (
    <SlottedText
      slot="description"
      className={clsx(
        "field-description",
        styles.fieldDescription,
        props.className
      )}
      {...props}
    />
  );
}
