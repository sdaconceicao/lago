"use client";
import clsx from "clsx";
import { SeparatorContext } from "react-aria-components/Separator";
import { ToggleButtonGroupContext } from "react-aria-components/ToggleButtonGroup";
import {
  Toolbar as RACToolbar,
  type ToolbarProps,
} from "react-aria-components/Toolbar";
import styles from "./Toolbar.module.css";

export function Toolbar(props: ToolbarProps) {
  const { orientation = "horizontal" } = props;
  return (
    <ToggleButtonGroupContext.Provider value={{ orientation }}>
      <SeparatorContext.Provider
        value={{
          orientation: orientation === "horizontal" ? "vertical" : "horizontal",
        }}
      >
        <RACToolbar
          {...props}
          className={
            props.className ?? clsx("react-aria-Toolbar", styles.toolbar)
          }
        />
      </SeparatorContext.Provider>
    </ToggleButtonGroupContext.Provider>
  );
}
