"use client";
import clsx from "clsx";
import type { CSSProperties, HTMLAttributes } from "react";
import {
  type AvatarShape,
  type AvatarSize,
  DEFAULT_AVATAR_SHAPE,
  DEFAULT_AVATAR_SIZE,
} from "../Avatar.types";
import styles from "./AvatarInitials.module.css";
import { getInitials, getInitialsColor } from "./AvatarInitials.utils";

/**
 * Props for the AvatarInitials component
 */
export interface AvatarInitialsProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * The person this avatar stands for, as a display name, an email address or
   * a username. Two initials are drawn from it when it names two parts of a
   * person ("Ada Lovelace", "ada.lovelace@example.com") and one when it reads
   * as a single word ("alovelace"). It is also the avatar's accessible name,
   * so a screen reader announces the person rather than the letters.
   */
  name: string;
  /**
   * The size of the avatar: 28px, 36px or 48px, matching the Button and field
   * of the same size. Ignored when rendered inside an `Avatar`, which passes
   * its own size down.
   *
   * @default 'md'
   */
  size?: AvatarSize;
  /**
   * The outline of the avatar. `circle` is fully round; `square` is a rounded
   * rectangle sharing the field radius of the matching size.
   *
   * @default 'circle'
   */
  shape?: AvatarShape;
  /** CSS class name for custom styling. Merged with the component's own classes. */
  className?: string;
}

/**
 * An avatar drawn from a person's name rather than a picture of them. Used on
 * its own, or by `Avatar` whenever no image is given.
 *
 * The fill takes a hue derived from `name`, so the same person keeps the same
 * colour everywhere without anyone having to store one. Override
 * `--avatar-color` through `style` or a class to pin it to a specific colour.
 */
export function AvatarInitials({
  name,
  size = DEFAULT_AVATAR_SIZE,
  shape = DEFAULT_AVATAR_SHAPE,
  className,
  style,
  ...props
}: AvatarInitialsProps) {
  return (
    <span
      {...props}
      className={clsx("avatar-initials", styles.initials, className)}
      data-avatar-size={size}
      data-shape={shape}
      role="img"
      aria-label={name}
      style={
        {
          "--avatar-color": getInitialsColor(name),
          ...style,
        } as CSSProperties
      }
    >
      {/* Hidden from assistive technology because the label above already says
          who this is; "AL" on its own would only be read out as noise. */}
      <span aria-hidden="true">{getInitials(name)}</span>
    </span>
  );
}
