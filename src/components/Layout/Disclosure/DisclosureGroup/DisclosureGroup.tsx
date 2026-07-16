"use client";
import clsx from "clsx";
import {
  type DisclosureGroupProps,
  DisclosureGroup as RACDisclosureGroup,
} from "react-aria-components/DisclosureGroup";
import styles from "./DisclosureGroup.module.css";

export function DisclosureGroup(props: DisclosureGroupProps) {
  return (
    <RACDisclosureGroup
      {...props}
      className={clsx(
        "react-aria-DisclosureGroup",
        styles.disclosureGroup,
        props.className
      )}
    />
  );
}
