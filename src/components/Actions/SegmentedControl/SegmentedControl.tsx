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

export function SegmentedControl(props: ToggleButtonGroupProps) {
  return (
    <RACToggleButtonGroup
      {...props}
      className={clsx(
        "segmented-control",
        styles.segmentedControl,
        utils.buttonBase
      )}
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
