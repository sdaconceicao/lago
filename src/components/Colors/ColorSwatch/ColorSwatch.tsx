"use client";
import clsx from "clsx";
import {
  ColorSwatch as AriaColorSwatch,
  type ColorSwatchProps,
} from "react-aria-components/ColorSwatch";
import styles from "./ColorSwatch.module.css";

export function ColorSwatch(props: ColorSwatchProps) {
  return (
    <AriaColorSwatch
      {...props}
      className={clsx("react-aria-ColorSwatch", styles.colorSwatch)}
      style={({ color }) => ({
        background: `linear-gradient(${color}, ${color}),
          repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`,
      })}
    />
  );
}
