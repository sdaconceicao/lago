"use client";
import clsx from "clsx";
import {
  ColorArea as AriaColorArea,
  type ColorAreaProps,
} from "react-aria-components/ColorArea";
import { ColorThumb } from "../ColorThumb/ColorThumb";
import styles from "./ColorArea.module.css";

export function ColorArea(props: ColorAreaProps) {
  return (
    <AriaColorArea
      {...props}
      className={clsx("react-aria-ColorArea", styles.colorArea)}
    >
      <ColorThumb />
    </AriaColorArea>
  );
}
