"use client";
import clsx from "clsx";
import {
  ToggleButtonGroup as RACToggleButtonGroup,
  type ToggleButtonGroupProps as RACToggleButtonGroupProps,
} from "react-aria-components/ToggleButtonGroup";
import styles from "./ToggleButtonGroup.module.css";

export interface ToggleButtonGroupProps extends RACToggleButtonGroupProps {
  /**
   * The size of every button in the group. `"sm"` is 28px tall, `"md"` (the
   * default) is 32px tall, and `"lg"` is 48px tall. The group's size wins over
   * a child ToggleButton's own `size` prop, because a group of mismatched
   * toggles is never wanted. Like Button, the group carries its own scale and
   * ignores the inherited field custom properties, so it keeps its height
   * inside a compact field.
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
