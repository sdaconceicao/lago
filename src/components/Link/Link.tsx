"use client";
import clsx from "clsx";
import { type LinkProps, Link as RACLink } from "react-aria-components/Link";
import styles from "./Link.module.css";

export function Link(props: LinkProps) {
  return (
    <RACLink
      {...props}
      className={clsx("react-aria-Link", styles.link, props.className)}
    />
  );
}
