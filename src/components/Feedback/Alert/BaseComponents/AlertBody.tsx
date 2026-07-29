import clsx from "clsx";
import type { HTMLAttributes } from "react";
import styles from "./AlertBody.module.css";

export type AlertBodyProps = HTMLAttributes<HTMLDivElement>;

export function AlertBody({ className, ...props }: AlertBodyProps) {
  return (
    <div
      {...props}
      className={clsx("alert-body", styles.alertBody, className)}
    />
  );
}
