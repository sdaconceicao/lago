"use client";
import { SeparatorContext } from "react-aria-components/Separator";
import { ToggleButtonGroupContext } from "react-aria-components/ToggleButtonGroup";
import {
  Toolbar as RACToolbar,
  type ToolbarProps,
} from "react-aria-components/Toolbar";
import "./Toolbar.css";

export function Toolbar(props: ToolbarProps) {
  const { orientation = "horizontal" } = props;
  return (
    <ToggleButtonGroupContext.Provider value={{ orientation }}>
      <SeparatorContext.Provider
        value={{
          orientation: orientation === "horizontal" ? "vertical" : "horizontal",
        }}
      >
        <RACToolbar {...props} />
      </SeparatorContext.Provider>
    </ToggleButtonGroupContext.Provider>
  );
}
