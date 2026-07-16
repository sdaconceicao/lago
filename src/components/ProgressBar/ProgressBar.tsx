"use client";
import type { CSSProperties } from "react";
import clsx from "clsx";
import {
  ProgressBar as AriaProgressBar,
  type ProgressBarProps as AriaProgressBarProps,
} from "react-aria-components/ProgressBar";
import { Label } from "../Inputs/Form/Form";
import utils from "../../styles/utilities.module.css";
import styles from "./ProgressBar.module.css";

export interface ProgressBarProps extends AriaProgressBarProps {
  label?: string;
}

export function ProgressBar({ label, ...props }: ProgressBarProps) {
  return (
    <AriaProgressBar
      {...props}
      className={clsx("react-aria-ProgressBar", styles.progressBar)}
    >
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          <Label>{label}</Label>
          <span className={clsx("value", styles.value)}>{valueText}</span>
          <div className={clsx(utils.track, utils.inset, styles.track)}>
            <div
              className={clsx("fill", styles.fill)}
              style={
                {
                  "--percent": (isIndeterminate ? 100 : percentage) + "%",
                } as CSSProperties
              }
            />
          </div>
        </>
      )}
    </AriaProgressBar>
  );
}
