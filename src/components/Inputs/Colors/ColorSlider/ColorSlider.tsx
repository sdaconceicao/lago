"use client";
import clsx from "clsx";
import {
  ColorSlider as AriaColorSlider,
  type ColorSliderProps as AriaColorSliderProps,
  SliderOutput,
  SliderTrack,
} from "react-aria-components/ColorSlider";
import { Label } from "../../Form/Form";
import { ColorThumb } from "../ColorThumb/ColorThumb";
import styles from "./ColorSlider.module.css";

export interface ColorSliderProps extends AriaColorSliderProps {
  label?: string;
}

export function ColorSlider({ label, ...props }: ColorSliderProps) {
  return (
    <AriaColorSlider
      {...props}
      className={clsx("react-aria-ColorSlider", styles.colorSlider)}
    >
      <Label>{label}</Label>
      <SliderOutput />
      <SliderTrack
        style={({ defaultStyle }) => ({
          background: `${defaultStyle.background},
            repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`,
        })}
      >
        <ColorThumb />
      </SliderTrack>
    </AriaColorSlider>
  );
}
