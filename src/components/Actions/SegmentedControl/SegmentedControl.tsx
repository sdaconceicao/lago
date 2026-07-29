"use client";
import clsx from "clsx";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import {
  ToggleButtonGroup as RACToggleButtonGroup,
  SelectionIndicator,
  ToggleButton,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
} from "react-aria-components/ToggleButtonGroup";
import utils from "@/styles/utilities.module.css";
import styles from "./SegmentedControl.module.css";

export interface SegmentedControlProps extends ToggleButtonGroupProps {
  /**
   * Control size: 28px, 36px, or 48px tall.
   *
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

export function SegmentedControl({
  size = "md",
  ...props
}: SegmentedControlProps) {
  return (
    <RACToggleButtonGroup
      {...props}
      className={clsx(
        "segmented-control",
        styles.segmentedControl,
        utils.buttonBase
      )}
      data-size={size}
      data-variant="secondary"
    />
  );
}

export function SegmentedControlItem(props: ToggleButtonProps) {
  return (
    <ToggleButton
      {...props}
      className={clsx("segmented-control-item", styles.segmentedControlItem)}
    >
      {composeRenderProps(props.children, (children) => (
        <>
          <SelectionIndicator
            className={clsx("react-aria-SelectionIndicator", utils.buttonBase)}
            data-selected
          />
          <span>{children}</span>
        </>
      ))}
    </ToggleButton>
  );
}
