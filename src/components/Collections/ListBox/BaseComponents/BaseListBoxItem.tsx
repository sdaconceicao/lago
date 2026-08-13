"use client";
import clsx from "clsx";
import {
  ListBoxItem as AriaListBoxItem,
  type ListBoxItemProps,
} from "react-aria-components/ListBox";

/**
 * What every list option shares wherever it is used: the `textValue` default
 * that lets a string child stand in for it, and the react-aria class hook. It
 * carries no styling of its own, and is internal — the styled options built on
 * it are the public API.
 *
 * The dropdown options — Select, MultiSelect and DropdownItem — build on this
 * rather than on `ListBoxItem`, because they are not variants of it. Each
 * restates all but a couple of the declarations `ListBoxItem` makes, so
 * stacking the two only ever left the few they happened not to restate
 * applying by accident: a `justify-content` written to centre a column
 * centring their row horizontally, a pressed `border-radius` displacing the
 * field radius, a selected background none of them ask for. Those land in the
 * same cascade layer at the same specificity, which leaves neither the option
 * sheet nor a consumer any way to win them back — so the layouts are kept
 * apart here instead of corrected property by property.
 */
export function BaseListBoxItem({ children, ...props }: ListBoxItemProps) {
  return (
    <AriaListBoxItem
      {...props}
      textValue={
        props.textValue ?? (typeof children === "string" ? children : undefined)
      }
      className={clsx("react-aria-ListBoxItem", props.className)}
    >
      {children}
    </AriaListBoxItem>
  );
}
