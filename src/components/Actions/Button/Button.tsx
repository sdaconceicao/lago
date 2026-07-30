"use client";
import clsx from "clsx";
import {
  Button as RACButton,
  type ButtonProps as RACButtonProps,
} from "react-aria-components/Button";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { ProgressCircle } from "@/components/Feedback/ProgressCircle/ProgressCircle";
import utils from "@/styles/utilities.module.css";
import styles from "./Button.module.css";

export interface ButtonProps extends RACButtonProps {
  /**
   * The visual style of the button (Vanilla CSS implementation specific).
   *
   * `primary`, `secondary` and `quiet` rank a button by emphasis and take the
   * theme tint. `info`, `success`, `warning` and `error` are semantic tones for
   * the action that resolves a state — retry, delete, confirm — and render as a
   * solid fill of that hue so they hold their own on a surface already tinted
   * with it, such as an Alert of the matching variant.
   *
   * @default 'primary'
   */
  variant?:
    | "primary"
    | "secondary"
    | "quiet"
    | "info"
    | "success"
    | "warning"
    | "error";
  /**
   * Button size: 28px, 36px, or 48px tall, matching the field of the same size.
   *
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

export function Button({ size = "md", ...props }: ButtonProps) {
  return (
    <RACButton
      {...props}
      className={clsx("react-aria-Button", styles.button, utils.buttonBase)}
      data-size={size}
      data-variant={props.variant || "primary"}
    >
      {composeRenderProps(props.children, (children, { isPending }) => (
        <>
          {!isPending && children}
          {isPending && (
            <ProgressCircle aria-label="Saving..." isIndeterminate />
          )}
        </>
      ))}
    </RACButton>
  );
}
