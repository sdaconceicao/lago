"use client";
import {
  ToggleButton,
  type ToggleButtonProps,
} from "@/components/Inputs/Toggle/ToggleButton/ToggleButton";

/**
 * An icon has no text for assistive technology to read, so an icon button has
 * no accessible name unless something supplies one. Requiring that in the type
 * makes the omission unrepresentable rather than something an audit finds later.
 *
 * Three routes count, and the third is not a loophole: a button filling a
 * react-aria slot is named by the container, in the user's own locale.
 */
type AccessibleName =
  | { "aria-label": string }
  | { "aria-labelledby": string }
  | { slot: string };

export type IconToggleButtonProps = Omit<
  ToggleButtonProps,
  "aria-label" | "aria-labelledby"
> &
  AccessibleName;

/**
 * A toggle button whose whole content is an icon: square at the size given,
 * with a fully round radius. Inside a ToggleButtonGroup the group's segmented
 * radii win, so it reads as one cell of the track rather than a lone circle.
 *
 * It is a `ToggleButton` underneath, so every variant, size and state behaves
 * identically — only the shape and the required accessible name differ. Reach
 * for `ToggleButton` the moment there is a visible label beside the icon.
 *
 * Unlike `IconButton`, which carries its own class, the shape here is keyed off
 * a `data-icon-only` attribute: ToggleButtonGroup restates the width for its
 * own size, and a CSS-module class cannot be selected from another module.
 */
export function IconToggleButton(props: IconToggleButtonProps) {
  return <ToggleButton {...(props as ToggleButtonProps)} data-icon-only="" />;
}
