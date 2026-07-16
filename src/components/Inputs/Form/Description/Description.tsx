"use client";
import clsx from "clsx";
import { type TextProps } from "react-aria-components/Text";
import { Text } from "@/components/Typography/Text/Text";
import styles from "./Description.module.css";

export function Description(props: TextProps) {
  return (
    <Text
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
