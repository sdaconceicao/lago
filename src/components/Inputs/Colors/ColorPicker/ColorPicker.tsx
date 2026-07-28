"use client";
import clsx from "clsx";
import { Button } from "react-aria-components/Button";
import {
  ColorPicker as AriaColorPicker,
  type ColorPickerProps as AriaColorPickerProps,
} from "react-aria-components/ColorPicker";
import { ColorArea } from "@/components/Inputs/Colors/ColorArea/ColorArea";
import { ColorField } from "@/components/Inputs/Colors/ColorField/ColorField";
import { ColorSlider } from "@/components/Inputs/Colors/ColorSlider/ColorSlider";
import { ColorSwatch } from "@/components/Inputs/Colors/ColorSwatch/ColorSwatch";
import {
  DEFAULT_FIELD_SIZE,
  type FieldSize,
} from "@/components/Inputs/FormComponents/index";
import { DialogTrigger } from "@/components/Overlays/Dialog/Dialog";
import { Popover } from "@/components/Overlays/Popover/Popover";
import styles from "./ColorPicker.module.css";

export interface ColorPickerProps
  extends Omit<AriaColorPickerProps, "children"> {
  /** Text rendered next to the swatch in the trigger button. */
  label?: string;
  /** Controls rendered inside the popover. Defaults to a ColorArea, a hue ColorSlider, and a hex ColorField. */
  children?: React.ReactNode;
  /**
   * The size of the field. `"sm"` renders a compact 28px-tall control and
   * `"md"` (the default) a 48px-tall one. Fields of the same size share their
   * height, border radius, horizontal padding, and font size, so they line up
   * when placed in a row.
   */
  size?: FieldSize;
}

/**
 * A color selection control: a swatch trigger that opens a popover combining a
 * ColorArea, a hue ColorSlider, and a hex ColorField.
 */
export function ColorPicker({
  label,
  children,
  size = DEFAULT_FIELD_SIZE,
  ...props
}: ColorPickerProps) {
  return (
    <AriaColorPicker {...props}>
      <DialogTrigger>
        {/* The RAC ColorPicker renders no DOM of its own, so the trigger button
            is this component's root and carries the size scope. */}
        <Button
          data-field-size={size}
          className={clsx("color-picker", styles.colorPicker)}
        >
          <ColorSwatch />
          <span>{label}</span>
        </Button>
        <Popover
          hideArrow
          placement="bottom start"
          // The popover is portaled out of the trigger, so it does not inherit
          // the trigger's --field-* custom properties and needs its own scope.
          data-field-size={size}
          className={styles.colorPickerDialog}
        >
          {children || (
            <>
              <ColorArea
                colorSpace="hsb"
                xChannel="saturation"
                yChannel="brightness"
              />
              <ColorSlider colorSpace="hsb" channel="hue" />
              <ColorField label="Hex" size={size} />
            </>
          )}
        </Popover>
      </DialogTrigger>
    </AriaColorPicker>
  );
}
