import type { HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./DialogFooter.module.css";

export type DialogFooterProps = HTMLAttributes<HTMLElement>;

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <footer
      {...props}
      className={clsx("dialog-footer", styles.dialogFooter, className)}
    />
  );
}
