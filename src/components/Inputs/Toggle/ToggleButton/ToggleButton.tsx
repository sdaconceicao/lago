"use client";
import clsx from "clsx";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import {
  ToggleButton as RACToggleButton,
  type ToggleButtonProps as RACToggleButtonProps,
} from "react-aria-components/ToggleButton";
import base from "@/styles/base.module.css";
import styles from "./ToggleButton.module.css";

export interface ToggleButtonProps extends RACToggleButtonProps {
  /**
   * The visual style of the button (Vanilla CSS implementation specific).
   *
   * @default 'primary'
   */
  variant?: "primary" | "secondary" | "quiet";
  /**
   * Button size: 28px, 36px, or 48px tall. A ToggleButtonGroup's size wins.
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
        base.buttonBase
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
