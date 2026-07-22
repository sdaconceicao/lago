"use client";
import type { CSSProperties } from "react";
import clsx from "clsx";
import {
  Meter as AriaMeter,
  type MeterProps as AriaMeterProps,
} from "react-aria-components/Meter";
import { Label } from "@/components/Inputs/FormComponents/index";
import utils from "@/styles/utilities.module.css";
import styles from "./Meter.module.css";

export interface MeterProps extends AriaMeterProps {
  label?: string;
}

export function Meter({ label, ...props }: MeterProps) {
  return (
    <AriaMeter {...props} className={clsx("react-aria-Meter", styles.meter)}>
      {({ percentage, valueText }) => (
        <>
          <Label>{label}</Label>
          <span className={clsx("value", styles.value)}>{valueText}</span>
          <div className={clsx(utils.track, utils.inset, styles.track)}>
            <div
              className={clsx("fill", styles.fill)}
              style={
                {
                  width: percentage + "%",
                  "--fill-color":
                    percentage < 70
                      ? "var(--green)"
                      : percentage < 90
                        ? "var(--orange)"
                        : "var(--red)",
                } as CSSProperties
              }
            />
          </div>
        </>
      )}
    </AriaMeter>
  );
}
