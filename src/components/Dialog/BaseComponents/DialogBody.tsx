import type { HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./DialogBody.module.css";

export type DialogBodyProps = HTMLAttributes<HTMLDivElement>;

export function DialogBody({ className, ...props }: DialogBodyProps) {
  return (
    <div
      {...props}
      className={clsx("dialog-body", styles.dialogBody, className)}
    />
  );
}
