"use client";
import clsx from "clsx";
import {
  Label as RACLabel,
  type LabelProps as RACLabelProps,
} from "react-aria-components/Label";
import styles from "./Label.module.css";

export interface LabelProps extends RACLabelProps {
  /** Whether the associated field is required. Appends a danger-styled asterisk to the label. */
  isRequired?: boolean;
}

export function Label({ isRequired, ...props }: LabelProps) {
  return (
    <RACLabel
      {...props}
      data-required={isRequired || undefined}
      className={clsx("react-aria-Label", styles.label, props.className)}
    />
  );
}
