"use client";
import clsx from "clsx";
import type { ListBoxItemProps } from "react-aria-components/ListBox";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { ListBoxItem } from "@/components/Collections/ListBox/ListBox";
import { CheckboxIndicator } from "@/components/Inputs/Checkbox/CheckboxItem/Checkbox";
import { Text } from "@/components/Typography/index";
import styles from "./MultiSelectItem.module.css";

/**
 * A list option for the MultiSelect dropdown. Renders the shared checkbox
 * indicator, which reflects the option's selection state (the ListBoxItem
 * itself handles toggling, so no interactive input is needed here).
 */
export function MultiSelectItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue ||
    (typeof props.children === "string" ? props.children : undefined);
  return (
    <ListBoxItem
      {...props}
      textValue={textValue}
      className={clsx("multi-select-item", styles.item)}
    >
      {composeRenderProps(props.children, (children) => (
        <>
          <CheckboxIndicator />
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
