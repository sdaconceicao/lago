import clsx from "clsx";
import {
  ColorThumb as AriaColorThumb,
  type ColorThumbProps,
} from "react-aria-components/ColorThumb";
import styles from "./ColorThumb.module.css";

export function ColorThumb(props: ColorThumbProps) {
  return (
    <AriaColorThumb
      {...props}
      className={clsx("react-aria-ColorThumb", styles.colorThumb)}
    />
  );
}
