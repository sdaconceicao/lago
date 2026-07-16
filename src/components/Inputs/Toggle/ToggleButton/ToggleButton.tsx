"use client";
import clsx from "clsx";
import {
  ToggleButton as RACToggleButton,
  type ToggleButtonProps as RACToggleButtonProps,
} from "react-aria-components/ToggleButton";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import utils from "@/styles/utilities.module.css";
import styles from "./ToggleButton.module.css";

interface ToggleButtonProps extends RACToggleButtonProps {
  /**
   * The visual style of the button (Vanilla CSS implementation specific).
   *
   * @default 'primary'
   */
  variant?: "primary" | "secondary" | "quiet";
}

export function ToggleButton(props: ToggleButtonProps) {
  return (
    <RACToggleButton
      {...props}
      className={clsx(
        "react-aria-ToggleButton",
        styles.toggleButton,
        utils.buttonBase
      )}
      data-variant={props.variant || "primary"}
    >
      {composeRenderProps(props.children, (children) => (
        <span>{children}</span>
      ))}
    </RACToggleButton>
  );
}
