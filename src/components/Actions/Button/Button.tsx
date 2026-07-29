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
   * @default 'primary'
   */
  variant?: "primary" | "secondary" | "quiet";
  /**
   * The size of the button. `"sm"` is 28px tall, `"md"` (the default) is 36px
   * tall, and `"lg"` is 48px tall. Buttons carry their own scale rather than
   * inheriting the field scale, so a button placed inside a compact field never
   * shrinks on its own. The control scale mirrors the field scale, so the sizes
   * line up step for step: `size="md"` matches a default (36px) field, `"sm"`
   * matches a `sm` field and `"lg"` a `lg` field. Give the button the same
   * `size` as the fields it shares a row with.
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
