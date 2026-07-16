"use client";
import clsx from "clsx";
import {
  ColorWheel as AriaColorWheel,
  type ColorWheelProps as AriaColorWheelProps,
  ColorWheelTrack,
} from "react-aria-components/ColorWheel";
import { ColorThumb } from "@/components/Inputs/Colors/ColorThumb/ColorThumb";
import styles from "./ColorWheel.module.css";

export interface ColorWheelProps extends Omit<
  AriaColorWheelProps,
  "outerRadius" | "innerRadius"
> {}

export function ColorWheel(props: ColorWheelProps) {
  return (
    <AriaColorWheel
      {...props}
      outerRadius={100}
      innerRadius={74}
      className={clsx("react-aria-ColorWheel", styles.colorWheel)}
    >
      <ColorWheelTrack />
      <ColorThumb />
    </AriaColorWheel>
  );
}
