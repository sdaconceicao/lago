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
   * The size of the control. `"sm"` renders a 28px-tall control with 12px text
   * and `"md"` (the default) a 32px-tall one with 14px text. The control carries
   * its own scale rather than inheriting the field scale, so one placed inside a
   * compact field never shrinks on its own.
   *
   * @default 'md'
   */
  size?: "sm" | "md";
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
