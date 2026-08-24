"use client";
import clsx from "clsx";
import { Check } from "lucide-react";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import {
  ListBox as AriaListBox,
  ListBoxLoadMoreItem as AriaListBoxLoadMoreItem,
  ListBoxSection as AriaListBoxSection,
  type ListBoxItemProps,
  type ListBoxLoadMoreItemProps,
  type ListBoxProps,
  type ListBoxSectionProps,
} from "react-aria-components/ListBox";
import { ProgressCircle } from "@/components/Feedback/ProgressCircle/ProgressCircle";
import { SlottedText } from "@/components/Typography/index";
import { BaseListBoxItem } from "./BaseComponents/BaseListBoxItem";
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
    <BaseListBoxItem
      {...props}
      textValue={textValue}
      className={clsx(styles.listBoxItem, props.className)}
    >
      {composeRenderProps(props.children, (children) =>
        typeof children === "string" ? (
          <SlottedText slot="label">{children}</SlottedText>
        ) : (
          children
        )
      )}
    </BaseListBoxItem>
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
    <BaseListBoxItem
      {...props}
      textValue={textValue}
      className={clsx("dropdown-item", styles.dropdownItem, props.className)}
    >
      {composeRenderProps(props.children, (children, { isSelected }) => (
        <>
          {isSelected && <Check className={styles.checkIcon} />}
          {typeof children === "string" ? (
            <SlottedText slot="label">{children}</SlottedText>
          ) : (
            children
          )}
        </>
      ))}
    </BaseListBoxItem>
  );
}

export type {
  ListBoxItemProps,
  ListBoxLoadMoreItemProps,
  ListBoxProps,
  ListBoxSectionProps,
};
