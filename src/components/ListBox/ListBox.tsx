"use client";
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
import "./ListBox.css";

export function ListBox<T>({ children, ...props }: ListBoxProps<T>) {
  return <AriaListBox {...props}>{children}</AriaListBox>;
}

export function ListBoxItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue ||
    (typeof props.children === "string" ? props.children : undefined);
  return (
    <AriaListBoxItem {...props} textValue={textValue}>
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
  return <AriaListBoxSection {...props} />;
}

export function ListBoxLoadMoreItem(props: ListBoxLoadMoreItemProps) {
  return (
    <AriaListBoxLoadMoreItem {...props}>
      <ProgressCircle isIndeterminate aria-label="Loading more..." />
    </AriaListBoxLoadMoreItem>
  );
}

export function DropdownListBox<T>(props: ListBoxProps<T>) {
  return <AriaListBox {...props} className="dropdown-listbox" />;
}

export function DropdownItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue ||
    (typeof props.children === "string" ? props.children : undefined);
  return (
    <ListBoxItem {...props} textValue={textValue} className="dropdown-item">
      {composeRenderProps(props.children, (children, { isSelected }) => (
        <>
          {isSelected && <Check />}
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
