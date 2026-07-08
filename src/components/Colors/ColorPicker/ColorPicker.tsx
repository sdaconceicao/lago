"use client";
import { Button } from "react-aria-components/Button";
import {
  ColorPicker as AriaColorPicker,
  type ColorPickerProps as AriaColorPickerProps,
} from "react-aria-components/ColorPicker";
import { DialogTrigger } from "../../Dialog/Dialog";
import { Popover } from "../../Popover/Popover";
import { ColorArea } from "../ColorArea/ColorArea";
import { ColorField } from "../ColorField/ColorField";
import { ColorSlider } from "../ColorSlider/ColorSlider";
import { ColorSwatch } from "../ColorSwatch/ColorSwatch";
import "./ColorPicker.css";

export interface ColorPickerProps extends Omit<
  AriaColorPickerProps,
  "children"
> {
  label?: string;
  children?: React.ReactNode;
}

export function ColorPicker({ label, children, ...props }: ColorPickerProps) {
  return (
    <AriaColorPicker {...props}>
      <DialogTrigger>
        <Button className="color-picker">
          <ColorSwatch />
          <span>{label}</span>
        </Button>
        <Popover
          hideArrow
          placement="bottom start"
          className="color-picker-dialog"
        >
          {children || (
            <>
              <ColorArea
                colorSpace="hsb"
                xChannel="saturation"
                yChannel="brightness"
              />
              <ColorSlider colorSpace="hsb" channel="hue" />
              <ColorField label="Hex" />
            </>
          )}
        </Popover>
      </DialogTrigger>
    </AriaColorPicker>
  );
}
