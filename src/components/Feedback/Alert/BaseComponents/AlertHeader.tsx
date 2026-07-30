"use client";
import clsx from "clsx";
import {
  CircleAlert,
  CircleCheck,
  Info,
  Megaphone,
  TriangleAlert,
  X,
} from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/Actions/Button/Button";
import { Heading } from "@/components/Typography/Heading/Heading";
import { type AlertVariant, useAlertVariant } from "../Alert.context";
import styles from "./AlertHeader.module.css";

/** The icon each variant falls back to when the consumer does not supply one. */
const VARIANT_ICONS: Record<AlertVariant, ReactNode> = {
  // The default alert announces rather than reports, so it gets its own glyph
  // instead of borrowing the `info` one — otherwise the two would be told apart
  // by colour alone, which is the one cue a grey alert has given up.
  default: <Megaphone size={20} aria-hidden="true" />,
  info: <Info size={20} aria-hidden="true" />,
  success: <CircleCheck size={20} aria-hidden="true" />,
  warning: <TriangleAlert size={20} aria-hidden="true" />,
  error: <CircleAlert size={20} aria-hidden="true" />,
};

export interface AlertHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Icon rendered in the leading gutter. Defaults to the icon for the
   * enclosing alert's variant; pass your own to override it.
   */
  icon?: ReactNode;
  /** Drops the leading icon and its gutter, closing the text up to the edge. */
  hideIcon?: boolean;
  /** The headline of the alert, rendered as a heading. */
  title: ReactNode;
  /** Supporting line below the title. Optional. */
  subtitle?: ReactNode;
  /**
   * Heading level for the title. Pick the level that fits the surrounding
   * document outline.
   *
   * @default 3
   */
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Called when the dismiss button is pressed. The button is only rendered
   * when this is provided — dismissing is opt in, and the alert does not
   * remove itself, so the caller owns the visibility.
   */
  onDismiss?: () => void;
  /**
   * Accessible label for the dismiss button.
   *
   * @default 'Dismiss'
   */
  dismissLabel?: string;
  /** Rendered after the title block, before the dismiss button. */
  children?: ReactNode;
  /** CSS class name for custom styling. Merged with the component's own classes. */
  className?: string;
}

export function AlertHeader({
  icon,
  hideIcon,
  title,
  subtitle,
  titleLevel = 3,
  onDismiss,
  dismissLabel = "Dismiss",
  children,
  className,
  ...props
}: AlertHeaderProps) {
  const variant = useAlertVariant();
  const resolvedIcon = hideIcon ? null : (icon ?? VARIANT_ICONS[variant]);

  return (
    // A `header` element would claim the `banner` landmark here — it is only
    // scoped away by article/aside/main/nav/section, and an alert is none of
    // those — so every alert on the page would register as a second banner.
    <div
      {...props}
      data-has-icon={resolvedIcon ? true : undefined}
      data-has-dismiss={onDismiss ? true : undefined}
      className={clsx("alert-header", styles.alertHeader, className)}
    >
      {resolvedIcon && (
        <span className={clsx("alert-icon", styles.alertIcon)}>
          {resolvedIcon}
        </span>
      )}
      {(title || subtitle) && (
        <div className={clsx("alert-header-text", styles.alertHeaderText)}>
          {title && (
            <Heading
              level={titleLevel}
              className={clsx("alert-title", styles.alertTitle)}
            >
              {title}
            </Heading>
          )}
          {subtitle && (
            <p className={clsx("alert-subtitle", styles.alertSubtitle)}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
      {onDismiss && (
        // Wrapped rather than classed directly: Button sets its own className
        // and drops any passed in, so the layout hook has to live outside it.
        <span className={clsx("alert-dismiss", styles.alertDismiss)}>
          <Button
            variant="quiet"
            size="sm"
            aria-label={dismissLabel}
            onPress={onDismiss}
          >
            <X size={16} />
          </Button>
        </span>
      )}
    </div>
  );
}
