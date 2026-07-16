"use client";
import clsx from "clsx";
import {
  Button as RACButton,
  type ButtonProps as RACButtonProps,
} from "react-aria-components/Button";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { ProgressCircle } from "@/components/Status/ProgressCircle/ProgressCircle";
import utils from "@/styles/utilities.module.css";
import styles from "./Button.module.css";

interface ButtonProps extends RACButtonProps {
  /**
   * The visual style of the button (Vanilla CSS implementation specific).
   *
   * @default 'primary'
   */
  variant?: "primary" | "secondary" | "quiet";
}

export function Button(props: ButtonProps) {
  return (
    <RACButton
      {...props}
      className={clsx("react-aria-Button", styles.button, utils.buttonBase)}
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
