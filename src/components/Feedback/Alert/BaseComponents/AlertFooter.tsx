import clsx from "clsx";
import type { HTMLAttributes } from "react";
import styles from "./AlertFooter.module.css";

export type AlertFooterProps = HTMLAttributes<HTMLDivElement>;

export function AlertFooter({ className, ...props }: AlertFooterProps) {
  return (
    // A `footer` element would claim the `contentinfo` landmark, which is
    // scoped to the page — see the matching note in AlertHeader.
    <div
      {...props}
      className={clsx("alert-footer", styles.alertFooter, className)}
    />
  );
}
