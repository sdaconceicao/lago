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
import {
  DEFAULT_FIELD_SIZE,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
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
  /**
   * The size of the control. `"sm"` renders a compact variant matching 28px
   * fields and `"md"` (the default) the standard one.
   */
  size?: FieldSize;
}

export function Slider<T extends number | number[]>({
  label,
  thumbLabels,
  fillOffset,
  size = DEFAULT_FIELD_SIZE,
  ...props
}: SliderProps<T>) {
  return (
    <AriaSlider
      {...props}
      data-field-size={size}
      className={clsx("react-aria-Slider", styles.slider)}
    >
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
            {state.values.map((_value, thumbIndex) => (
              <SliderThumb
                /* A thumb's identity is its position: the index is what binds
                   it to a value, and thumbs are never reordered. Keying on the
                   value instead changes the key on every move, which remounts
                   the thumb mid-drag and strands its pointer capture and focus
                   — the slider could then only advance one step per
                   interaction. */
                // biome-ignore lint/suspicious/noArrayIndexKey: position is the identity
                key={thumbIndex}
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
