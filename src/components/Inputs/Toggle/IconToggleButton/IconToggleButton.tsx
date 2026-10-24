"use client";
import {
  ToggleButton,
  type ToggleButtonProps,
} from "@/components/Inputs/Toggle/ToggleButton/ToggleButton";

type AccessibleName =
  | {
      /** Accessible name when the icon has no visible label. */
      "aria-label": string;
    }
  | {
      /** ID of the element that labels this button. */
      "aria-labelledby": string;
    }
  | {
      /** A React Aria slot whose parent supplies the accessible name. */
      slot: string;
    };

/** ToggleButton props with a required accessible name for icon-only content. */
export type IconToggleButtonProps = Omit<
  ToggleButtonProps,
  "aria-label" | "aria-labelledby"
> &
  AccessibleName;

/**
 * An icon-only ToggleButton with equal width and height and ToggleButton's
 * corner radius. ToggleButtonGroup supplies segmented corners when grouped.
 *
 * ToggleButton owns selection, keyboard interaction and styling. This wrapper
 * adds square sizing and a required accessible name. Use ToggleButton for a
 * visible text label, or IconButton for an action without a selected state.
 */
export function IconToggleButton(props: IconToggleButtonProps) {
  return <ToggleButton {...(props as ToggleButtonProps)} data-icon-only="" />;
}
