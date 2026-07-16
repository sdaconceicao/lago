"use client";
import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { Heading } from "react-aria-components/Dialog";
import { Button } from "@/components/Button/Button";
import styles from "./DialogHeader.module.css";

export interface DialogHeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  /** Featured icon rendered in a bordered tile to the left of the title. */
  icon?: ReactNode;
  /** Rendered as the slotted title heading, labelling the dialog. */
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Hides the close button rendered in the dialog's top-right corner. */
  hideCloseButton?: boolean;
}

export function DialogHeader({
  icon,
  title,
  subtitle,
  hideCloseButton,
  children,
  className,
  ...props
}: DialogHeaderProps) {
  return (
    <header
      {...props}
      className={clsx(
        "dialog-header",
        styles.dialogHeader,
        hideCloseButton && "dialog-header--no-close",
        hideCloseButton && styles.dialogHeaderNoClosed,
        className
      )}
    >
      {icon && (
        <div className={clsx("dialog-header-icon", styles.dialogHeaderIcon)}>
          {icon}
        </div>
      )}
      {(title || subtitle) && (
        <div className={clsx("dialog-header-text", styles.dialogHeaderText)}>
          {title && <Heading slot="title">{title}</Heading>}
          {subtitle && (
            <p className={clsx("dialog-subtitle", styles.dialogSubtitle)}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
      {!hideCloseButton && (
        <Button slot="close" variant="quiet" aria-label="Close">
          <X size={16} />
        </Button>
      )}
    </header>
  );
}
