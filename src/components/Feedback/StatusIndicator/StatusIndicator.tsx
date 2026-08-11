import clsx from "clsx";
import type { HTMLAttributes } from "react";
import styles from "./StatusIndicator.module.css";

/**
 * Whether a person is around, and how available they are.
 *
 * - `"online"` — green, available.
 * - `"busy"` — red, do not disturb.
 * - `"idle"` — orange, signed in but away from the keyboard.
 * - `"offline"` — grey, not signed in.
 */
export type PresenceStatus = "online" | "busy" | "idle" | "offline";

/**
 * What a screen reader announces for each state. Hue is the only thing that
 * separates the four visually, so the dot is always named.
 */
export const PRESENCE_STATUS_LABELS: Record<PresenceStatus, string> = {
  online: "Online",
  busy: "Busy",
  idle: "Idle",
  offline: "Offline",
};

/**
 * Props for the StatusIndicator component
 */
export interface StatusIndicatorProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The presence state to report: `online`, `busy`, `idle` or `offline`. */
  status: PresenceStatus;
  /**
   * The size of the dot: 8px, 10px or 12px. The steps line up with the Avatar
   * of the same name, which is what an Avatar passes down when it renders one.
   *
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
  /**
   * Accessible name for the dot. Defaults to the capitalised status
   * ("Online"); pass something more specific where the state means more in
   * context, such as "Away until Monday". Pass an empty string when the state
   * is already written beside the dot, so it is skipped rather than read out
   * twice.
   */
  label?: string;
  /** CSS class name for custom styling. Merged with the component's default classes. */
  className?: string;
}

/**
 * A coloured dot reporting whether someone is available. Used on its own beside
 * a name, or by `Avatar`, which positions one on the edge of the frame.
 */
export function StatusIndicator({
  status,
  size = "md",
  label,
  className,
  ...props
}: StatusIndicatorProps) {
  // An empty label means the state is written out beside the dot, so the dot is
  // decorative — the same convention as an image with an empty `alt`. The role
  // and the name have to travel together, hence one object rather than two
  // props that could be set apart from each other.
  const labelProps =
    label === ""
      ? ({ "aria-hidden": true } as const)
      : ({
          role: "img",
          "aria-label": label ?? PRESENCE_STATUS_LABELS[status],
        } as const);

  return (
    <span
      {...props}
      {...labelProps}
      className={clsx("status-indicator", styles.indicator, className)}
      data-status={status}
      data-status-size={size}
    />
  );
}
