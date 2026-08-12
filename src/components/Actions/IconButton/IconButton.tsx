"use client";
import clsx from "clsx";
import { Button, type ButtonProps } from "@/components/Actions/Button/Button";
import styles from "./IconButton.module.css";

/**
 * An icon has no text for assistive technology to read, so an icon button has
 * no accessible name unless something supplies one. Requiring that in the type
 * makes the omission unrepresentable rather than something an audit finds later.
 *
 * Three routes count, and the third is not a loophole: a button filling a
 * react-aria slot — a Calendar's `slot="previous"`, say — is named by the
 * container, in the user's own locale. Demanding an `aria-label` there would
 * mean hard-coding English over a translated one.
 */
type AccessibleName =
  | { "aria-label": string }
  | { "aria-labelledby": string }
  | { slot: string };

export type IconButtonProps = Omit<
  ButtonProps,
  "aria-label" | "aria-labelledby"
> &
  AccessibleName;

/**
 * A button whose whole content is an icon: square at the size given, with a
 * fully round radius.
 *
 * It is a `Button` underneath, so every variant, size, state and the pending
 * treatment behave identically — only the shape and the required accessible
 * name differ. Reach for `Button` the moment there is a visible label beside
 * the icon; a labelled button should size to its text.
 */
export function IconButton({ className, ...props }: IconButtonProps) {
  return (
    <Button
      {...(props as ButtonProps)}
      className={clsx(styles.iconButton, className)}
    />
  );
}
