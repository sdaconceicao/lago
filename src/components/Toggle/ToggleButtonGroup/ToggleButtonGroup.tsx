"use client";
import clsx from "clsx";
import {
  ToggleButtonGroup as RACToggleButtonGroup,
  type ToggleButtonGroupProps,
} from "react-aria-components/ToggleButtonGroup";
import styles from "./ToggleButtonGroup.module.css";

export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
  return (
    <RACToggleButtonGroup
      {...props}
      className={clsx("react-aria-ToggleButtonGroup", styles.toggleButtonGroup)}
    />
  );
}
