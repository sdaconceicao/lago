"use client";
import clsx from "clsx";
import { Check } from "lucide-react";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import type { ListBoxItemProps } from "react-aria-components/ListBox";
import { BaseListBoxItem } from "@/components/Collections/ListBox/BaseComponents/BaseListBoxItem";
import { SlottedText } from "@/components/Typography/index";
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
    <BaseListBoxItem
      {...props}
      textValue={textValue}
      className={clsx("select-item", styles.item, props.className)}
    >
      {composeRenderProps(props.children, (children, { isSelected }) => (
        <>
          {typeof children === "string" ? (
            <SlottedText slot="label">{children}</SlottedText>
          ) : (
            children
          )}
          {isSelected && (
            <Check aria-hidden="true" className={styles.checkIcon} />
          )}
        </>
      ))}
    </BaseListBoxItem>
  );
}
