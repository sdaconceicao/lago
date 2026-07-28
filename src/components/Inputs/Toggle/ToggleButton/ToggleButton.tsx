"use client";
import clsx from "clsx";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import {
  ToggleButton as RACToggleButton,
  type ToggleButtonProps as RACToggleButtonProps,
} from "react-aria-components/ToggleButton";
import utils from "@/styles/utilities.module.css";
import styles from "./ToggleButton.module.css";

export interface ToggleButtonProps extends RACToggleButtonProps {
  /**
   * The visual style of the button (Vanilla CSS implementation specific).
   *
   * @default 'primary'
   */
  variant?: "primary" | "secondary" | "quiet";
  /**
   * The size of the button. `"sm"` is 28px tall, `"md"` (the default) is 32px
   * tall, and `"lg"` is 48px tall. Toggle buttons carry their own scale rather
   * than inheriting the field scale, so one placed inside a compact field never
   * shrinks on its own. Inside a ToggleButtonGroup the group's own `size` wins
   * over this prop, because a group of mismatched toggles is never wanted.
   *
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

export function ToggleButton({ size = "md", ...props }: ToggleButtonProps) {
  return (
    <RACToggleButton
      {...props}
      className={clsx(
        "react-aria-ToggleButton",
        styles.toggleButton,
        utils.buttonBase
      )}
      data-size={size}
      data-variant={props.variant || "primary"}
    >
      {composeRenderProps(props.children, (children) => (
        <span>{children}</span>
      ))}
    </RACToggleButton>
  );
}
