import type { HTMLAttributes } from "react";
import clsx from "clsx";
import "./DialogBody.css";

export type DialogBodyProps = HTMLAttributes<HTMLDivElement>;

export function DialogBody({ className, ...props }: DialogBodyProps) {
  return <div {...props} className={clsx("dialog-body", className)} />;
}
