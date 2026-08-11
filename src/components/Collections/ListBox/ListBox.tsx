"use client";
import clsx from "clsx";
import { Check } from "lucide-react";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
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
import { ProgressCircle } from "@/components/Feedback/ProgressCircle/ProgressCircle";
import { Text } from "@/components/Typography/index";
import styles from "./ListBox.module.css";

export function ListBox<T>({ children, ...props }: ListBoxProps<T>) {
  return (
    <AriaListBox
      {...props}
      className={clsx("react-aria-ListBox", styles.listBox, props.className)}
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
      className={clsx(
        "react-aria-ListBoxItem",
        styles.listBoxItem,
        props.className
      )}
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
      className={clsx(
        "react-aria-ListBoxSection",
        styles.listBoxSection,
        props.className
      )}
    />
  );
}

export function ListBoxLoadMoreItem(props: ListBoxLoadMoreItemProps) {
  return (
    <AriaListBoxLoadMoreItem
      {...props}
      className={clsx(
        "react-aria-ListBoxLoadingIndicator",
        styles.listBoxLoadingIndicator,
        props.className
      )}
    >
      <ProgressCircle isIndeterminate aria-label="Loading more..." />
    </AriaListBoxLoadMoreItem>
  );
}

export function DropdownListBox<T>(props: ListBoxProps<T>) {
  return (
    <AriaListBox
      {...props}
      className={clsx(
        "dropdown-listbox",
        styles.dropdownListbox,
        props.className
      )}
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
      className={clsx("dropdown-item", styles.dropdownItem, props.className)}
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

export { Header, Text };
