"use client";
import clsx from "clsx";
import { Check } from "lucide-react";
import type { ListBoxItemProps } from "react-aria-components/ListBox";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { ListBoxItem } from "@/components/Collections/ListBox/ListBox";
import { Text } from "@/components/Typography/index";
import styles from "./SelectItem.module.css";

/**
 * A list option for the Select dropdown. The selected option shows a check
 * pinned to the right so unselected items keep a clean left edge.
 */
export function SelectItem(props: ListBoxItemProps) {
  const textValue =
    props.textValue ||
    (typeof props.children === "string" ? props.children : undefined);
  return (
    <ListBoxItem
      {...props}
      textValue={textValue}
      className={clsx("select-item", styles.item)}
    >
      {composeRenderProps(props.children, (children, { isSelected }) => (
        <>
          {typeof children === "string" ? (
            <Text slot="label">{children}</Text>
          ) : (
            children
          )}
          {isSelected && (
            <Check aria-hidden="true" className={styles.checkIcon} />
          )}
        </>
      ))}
    </ListBoxItem>
  );
}
