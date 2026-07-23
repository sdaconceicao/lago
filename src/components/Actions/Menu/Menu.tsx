"use client";
import clsx from "clsx";
import { Check, ChevronRight, Dot } from "lucide-react";
import React from "react";
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger as AriaMenuTrigger,
  SubmenuTrigger as AriaSubmenuTrigger,
  Header,
  Keyboard,
  type MenuItemProps,
  type MenuProps,
  type MenuSectionProps,
  type MenuTriggerProps,
  Separator,
  type SubmenuTriggerProps,
} from "react-aria-components/Menu";
import { Popover } from "@/components/Overlays/Popover/Popover";
import { Text } from "@/components/Typography/index";
import styles from "./Menu.module.css";

export function MenuTrigger(props: MenuTriggerProps) {
  const [trigger, menu] = React.Children.toArray(props.children) as [
    React.ReactElement,
    React.ReactElement,
  ];
  return (
    <AriaMenuTrigger {...props}>
      {trigger}
      <Popover>{menu}</Popover>
    </AriaMenuTrigger>
  );
}

export function Menu<T>(props: MenuProps<T>) {
  return (
    <AriaMenu
      {...props}
      className={clsx("react-aria-Menu", styles.menu, props.className)}
    >
      {props.children}
    </AriaMenu>
  );
}

export function MenuItem(
  props: Omit<MenuItemProps, "children"> & { children?: React.ReactNode }
) {
  const textValue =
    props.textValue ||
    (typeof props.children === "string" ? props.children : undefined);
  return (
    <AriaMenuItem
      {...props}
      textValue={textValue}
      className={clsx("react-aria-MenuItem", styles.menuItem, props.className)}
    >
      {({ hasSubmenu, isSelected, selectionMode }) => (
        <>
          {isSelected && selectionMode === "multiple" ? <Check /> : null}
          {isSelected && selectionMode === "single" ? <Dot /> : null}
          {typeof props.children === "string" ? (
            <Text slot="label">{props.children}</Text>
          ) : (
            props.children
          )}
          {hasSubmenu && <ChevronRight />}
        </>
      )}
    </AriaMenuItem>
  );
}

export function MenuSection<T>(props: MenuSectionProps<T>) {
  return (
    <AriaMenuSection
      {...props}
      className={clsx(
        "react-aria-MenuSection",
        styles.menuSection,
        props.className
      )}
    />
  );
}

export function SubmenuTrigger(props: SubmenuTriggerProps) {
  const [trigger, menu] = React.Children.toArray(props.children) as [
    React.ReactElement,
    React.ReactElement,
  ];
  return (
    <AriaSubmenuTrigger {...props}>
      {trigger}
      <Popover hideArrow offset={-2} crossOffset={-4}>
        {menu}
      </Popover>
    </AriaSubmenuTrigger>
  );
}

export { Header, Keyboard, Separator, Text };
