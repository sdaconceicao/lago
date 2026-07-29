"use client";
import clsx from "clsx";
import {
  ToggleButtonGroup as RACToggleButtonGroup,
  type ToggleButtonGroupProps as RACToggleButtonGroupProps,
} from "react-aria-components/ToggleButtonGroup";
import styles from "./ToggleButtonGroup.module.css";

export interface ToggleButtonGroupProps extends RACToggleButtonGroupProps {
  /**
   * Size of every button in the group, overriding each button's own `size`.
   *
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

export function ToggleButtonGroup({
  size = "md",
  ...props
}: ToggleButtonGroupProps) {
  return (
    <RACToggleButtonGroup
      {...props}
      data-size={size}
      className={clsx("react-aria-ToggleButtonGroup", styles.toggleButtonGroup)}
    />
  );
}
