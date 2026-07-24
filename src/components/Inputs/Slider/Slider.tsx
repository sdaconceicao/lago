"use client";
import clsx from "clsx";
import {
  Slider as AriaSlider,
  type SliderProps as AriaSliderProps,
  SliderFill,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "react-aria-components/Slider";
import { Label } from "@/components/Inputs/FormComponents/index";
import utils from "@/styles/utilities.module.css";
import styles from "./Slider.module.css";

export interface SliderProps<T> extends AriaSliderProps<T> {
  /** Label for the slider. */
  label?: string;
  /** Aria labels for each thumb. */
  thumbLabels?: string[];
  /**
   * The offset from which to start the fill.
   *
   * @default 0
   */
  fillOffset?: number;
}

export function Slider<T extends number | number[]>({
  label,
  thumbLabels,
  fillOffset,
  ...props
}: SliderProps<T>) {
  return (
    <AriaSlider {...props} className={clsx("react-aria-Slider", styles.slider)}>
      {label && <Label>{label}</Label>}
      <SliderOutput
        className={clsx("react-aria-SliderOutput", styles.sliderOutput)}
      />
      <SliderTrack
        className={clsx("react-aria-SliderTrack", styles.sliderTrack)}
      >
        {({ state, isDisabled }) => (
          <>
            <div
              className={clsx(utils.track, utils.inset, styles.track)}
              data-disabled={isDisabled || undefined}
            >
              <SliderFill
                offset={fillOffset}
                className={clsx("react-aria-SliderFill", styles.sliderFill)}
              />
            </div>
            {state.values.map((value, thumbIndex) => (
              <SliderThumb
                key={thumbLabels?.[thumbIndex] ?? `thumb-${value}`}
                index={thumbIndex}
                aria-label={thumbLabels?.[thumbIndex]}
                className={clsx(
                  "react-aria-SliderThumb",
                  styles.sliderThumb,
                  utils.indicator
                )}
              />
            ))}
          </>
        )}
      </SliderTrack>
    </AriaSlider>
  );
}
