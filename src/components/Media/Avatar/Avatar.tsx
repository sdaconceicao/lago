"use client";
import clsx from "clsx";
import { User } from "lucide-react";
import { type HTMLAttributes, useState } from "react";
import {
  type PresenceStatus,
  StatusIndicator,
} from "@/components/Feedback/StatusIndicator/StatusIndicator";
import styles from "./Avatar.module.css";
import {
  type AvatarShape,
  type AvatarSize,
  DEFAULT_AVATAR_SHAPE,
  DEFAULT_AVATAR_SIZE,
} from "./Avatar.types";
import {
  AvatarInitials,
  type AvatarInitialsProps,
} from "./BaseComponents/AvatarInitials";

/**
 * Props for the Avatar component
 */
export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * URL of the person's picture. When it is absent — or fails to load — the
   * avatar falls back to initials drawn from `name`, and to a generic person
   * icon when there is no name either.
   */
  src?: string;
  /**
   * Alternative text for the image. Defaults to `name`. Pass an empty string
   * for an avatar that only repeats a name already written beside it, so it is
   * skipped rather than read twice.
   */
  alt?: string;
  /**
   * The person this avatar stands for, as a display name, an email address or
   * a username. Used for the initials fallback and as the default `alt`.
   */
  name?: string;
  /**
   * The size of the avatar: 28px, 36px or 48px, matching the Button and field
   * of the same size.
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
  /**
   * Presence state, shown as a `StatusIndicator` on the lower trailing edge:
   * `online` green, `busy` red, `idle` orange, `offline` grey. Omit it and no
   * dot is rendered.
   */
  status?: PresenceStatus;
  /**
   * Accessible name for the presence indicator. Defaults to the capitalised
   * status ("Online"); override it to say what the state means in context,
   * such as "Away until Monday", or pass an empty string where the state is
   * already written beside the avatar.
   */
  statusLabel?: string;
  /** CSS class name for custom styling. Merged with the component's default classes. */
  className?: string;
}

/**
 * A person's picture at one of the library's three control sizes, with an
 * initials fallback and an optional presence indicator.
 */
export function Avatar({
  src,
  alt,
  name,
  size = DEFAULT_AVATAR_SIZE,
  shape = DEFAULT_AVATAR_SHAPE,
  status,
  statusLabel,
  className,
  ...props
}: AvatarProps) {
  // Remembering which URL failed, rather than a plain boolean, resets the
  // fallback on its own when `src` changes — no effect needed to clear it.
  const [failedSrc, setFailedSrc] = useState<string>();
  const showImage = Boolean(src) && src !== failedSrc;
  const initialsName = name?.trim();

  return (
    <span
      {...props}
      className={clsx("avatar", styles.avatar, className)}
      data-avatar-size={size}
      data-shape={shape}
    >
      {showImage && (
        <img
          className={clsx("avatar-image", styles.image)}
          src={src}
          alt={alt ?? name ?? ""}
          onError={() => setFailedSrc(src)}
        />
      )}
      {!showImage && initialsName && (
        <AvatarInitials name={initialsName} size={size} shape={shape} />
      )}
      {!showImage && !initialsName && (
        <span className={clsx("avatar-placeholder", styles.placeholder)}>
          <User aria-hidden="true" />
        </span>
      )}
      {status && (
        <StatusIndicator
          className={styles.status}
          status={status}
          size={size}
          label={statusLabel}
        />
      )}
    </span>
  );
}

Avatar.Initials = AvatarInitials;

export type { AvatarInitialsProps, AvatarShape, AvatarSize };
export { AvatarInitials, DEFAULT_AVATAR_SHAPE, DEFAULT_AVATAR_SIZE };
