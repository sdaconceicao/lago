"use client";
import clsx from "clsx";
import {
  ColorSwatchPicker as AriaColorSwatchPicker,
  ColorSwatchPickerItem as AriaColorSwatchPickerItem,
  type ColorSwatchPickerItemProps,
  type ColorSwatchPickerProps,
} from "react-aria-components/ColorSwatchPicker";
import { ColorSwatch } from "@/components/Inputs/Colors/ColorSwatch/ColorSwatch";
import styles from "./ColorSwatchPicker.module.css";

export function ColorSwatchPicker({
  children,
  ...props
}: ColorSwatchPickerProps) {
  return (
    <AriaColorSwatchPicker
      {...props}
      className={clsx("react-aria-ColorSwatchPicker", styles.colorSwatchPicker)}
    >
      {children}
    </AriaColorSwatchPicker>
  );
}

export function ColorSwatchPickerItem(props: ColorSwatchPickerItemProps) {
  return (
    <AriaColorSwatchPickerItem
      {...props}
      className={clsx(
        "react-aria-ColorSwatchPickerItem",
        styles.colorSwatchPickerItem
      )}
    >
      <ColorSwatch />
    </AriaColorSwatchPickerItem>
  );
}
