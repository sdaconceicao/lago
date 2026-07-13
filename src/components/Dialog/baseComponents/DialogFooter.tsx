import type { HTMLAttributes } from "react";
import clsx from "clsx";
import "./DialogFooter.css";

export type DialogFooterProps = HTMLAttributes<HTMLElement>;

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return <footer {...props} className={clsx("dialog-footer", className)} />;
}
