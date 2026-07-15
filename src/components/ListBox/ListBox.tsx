"use client";
import clsx from "clsx";
import { Check } from "lucide-react";
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  ListBoxLoadMoreItem as AriaListBoxLoadMoreItem,
  ListBoxSection as AriaListBoxSection,
  Header,
  type ListBoxItemProps,
  type ListBoxLoadMoreItemProps,
  type ListBoxProps,
  type ListBoxSectionProps,
} from "react-aria-components/ListBox";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { Text } from "../Content/Content";
import { ProgressCircle } from "../ProgressCircle/ProgressCircle";
import styles from "./ListBox.module.css";

export function ListBox<T>({ children, ...props }: ListBoxProps<T>) {
  return (
    <AriaListBox
      {...props}
      className={props.className ?? clsx("react-aria-ListBox", styles.listBox)}
    >
      {children}
    </AriaListBox>
  );
}

export function ListBoxItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue ||
    (typeof props.children === "string" ? props.children : undefined);
  return (
    <AriaListBoxItem
      {...props}
      textValue={textValue}
      className={
        props.className ?? clsx("react-aria-ListBoxItem", styles.listBoxItem)
      }
    >
      {composeRenderProps(props.children, (children) =>
        typeof children === "string" ? (
          <Text slot="label">{children}</Text>
        ) : (
          children
        )
      )}
    </AriaListBoxItem>
  );
}

export function ListBoxSection<T>(props: ListBoxSectionProps<T>) {
  return (
    <AriaListBoxSection
      {...props}
      className={
        props.className ??
        clsx("react-aria-ListBoxSection", styles.listBoxSection)
      }
    />
  );
}

export function ListBoxLoadMoreItem(props: ListBoxLoadMoreItemProps) {
  return (
    <AriaListBoxLoadMoreItem
      {...props}
      className={
        props.className ??
        clsx(
          "react-aria-ListBoxLoadingIndicator",
          styles.listBoxLoadingIndicator
        )
      }
    >
      <ProgressCircle isIndeterminate aria-label="Loading more..." />
    </AriaListBoxLoadMoreItem>
  );
}

export function DropdownListBox<T>(props: ListBoxProps<T>) {
  return (
    <AriaListBox
      {...props}
      className={clsx("dropdown-listbox", styles.dropdownListbox)}
    />
  );
}

export function DropdownItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue ||
    (typeof props.children === "string" ? props.children : undefined);
  return (
    <ListBoxItem
      {...props}
      textValue={textValue}
      className={clsx("dropdown-item", styles.dropdownItem)}
    >
      {composeRenderProps(props.children, (children, { isSelected }) => (
        <>
          {isSelected && <Check className={styles.checkIcon} />}
          {typeof children === "string" ? (
            <Text slot="label">{children}</Text>
          ) : (
            children
          )}
        </>
      ))}
    </ListBoxItem>
  );
}

export { Text, Header };
