"use client";
import clsx from "clsx";
import {
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
  OverlayArrow,
} from "react-aria-components/Popover";
import styles from "./Popover.module.css";

export interface PopoverProps extends Omit<AriaPopoverProps, "children"> {
  children: React.ReactNode;
  hideArrow?: boolean;
}

export function Popover({ children, hideArrow, ...props }: PopoverProps) {
  return (
    <AriaPopover
      {...props}
      className={clsx("react-aria-Popover", styles.popover, props.className)}
    >
      {({ trigger }) => (
        <>
          {!hideArrow &&
            trigger !== "MenuTrigger" &&
            trigger !== "SubmenuTrigger" && (
              <OverlayArrow>
                <svg
                  aria-hidden="true"
                  width={12}
                  height={12}
                  viewBox="0 0 12 12"
                >
                  <path d="M0 0 L6 6 L12 0" />
                </svg>
              </OverlayArrow>
            )}
          {children}
        </>
      )}
    </AriaPopover>
  );
}
