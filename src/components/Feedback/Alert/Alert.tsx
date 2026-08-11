"use client";
import clsx from "clsx";
import type { HTMLAttributes } from "react";
import {
  type AlertType,
  type AlertVariant,
  AlertVariantContext,
} from "./Alert.context";
import styles from "./Alert.module.css";
import { AlertBody, type AlertBodyProps } from "./BaseComponents/AlertBody";
import {
  AlertFooter,
  type AlertFooterProps,
} from "./BaseComponents/AlertFooter";
import {
  AlertHeader,
  type AlertHeaderProps,
} from "./BaseComponents/AlertHeader";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The semantic tone of the message. Sets the surface, border, icon and text
   * colours, and the default icon rendered by `Alert.Header`.
   *
   * `default` carries no hue — it takes the library's own surface and text
   * tokens, so it reads as white on a light page and a raised grey on a dark
   * one. Reach for one of the four hues only when the message genuinely reports
   * a status.
   *
   * @default 'default'
   */
  variant?: AlertVariant;
  /**
   * The shape of the alert. `module` is rounded, fully bordered and sized to
   * the content it sits in; `fullWidth` fills its container with square
   * corners and hairlines top and bottom, for banners pinned above a page or
   * section.
   *
   * @default 'module'
   */
  type?: AlertType;
  /**
   * How assistive technology announces the alert. `status` (polite) suits an
   * alert that is present when the page renders. Use `alert` for an urgent
   * message inserted in response to an action — it interrupts the screen
   * reader — and `none` for a purely decorative banner that repeats content
   * already available on the page.
   *
   * @default 'status'
   */
  role?: "status" | "alert" | "none";
  /** CSS class name for custom styling. Merged with the component's own classes. */
  className?: string;
}

export function Alert({
  variant = "default",
  type = "module",
  role = "status",
  className,
  ...props
}: AlertProps) {
  return (
    <AlertVariantContext.Provider value={variant}>
      <div
        {...props}
        role={role}
        data-variant={variant}
        data-type={type}
        className={clsx("alert", styles.alert, className)}
      />
    </AlertVariantContext.Provider>
  );
}

Alert.Header = AlertHeader;
Alert.Body = AlertBody;
Alert.Footer = AlertFooter;

export { AlertVariantContext, useAlertVariant } from "./Alert.context";
export type {
  AlertBodyProps,
  AlertFooterProps,
  AlertHeaderProps,
  AlertType,
  AlertVariant,
};
export { AlertBody, AlertFooter, AlertHeader };
