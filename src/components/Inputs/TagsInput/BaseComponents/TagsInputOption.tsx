"use client";
import { Plus } from "lucide-react";
import { DropdownItem } from "@/components/Collections/ListBox/ListBox";
import { SlottedText } from "@/components/Typography/index";
import {
  CREATE_KEY,
  getCreateLabel,
  type TagsInputItem,
} from "../TagsInput.utils";
import styles from "./TagsInputOption.module.css";

export interface TagsInputOptionProps {
  /** The collection item to render. The synthetic create row is rendered as an "Add …" action. */
  item: TagsInputItem;
}

/**
 * A row in the TagsInput's dropdown. Ordinary options render as dropdown items
 * that show a check once their tag is added; the create row renders as an
 * "Add …" action carrying the text the user typed.
 */
export function TagsInputOption({ item }: TagsInputOptionProps) {
  if (item.id === CREATE_KEY) {
    const label = getCreateLabel(item.label);
    return (
      // textValue matches the visible text, and contains the query verbatim so
      // the ComboBox's filter always keeps this row (see getCreateLabel).
      <DropdownItem id={CREATE_KEY} textValue={label}>
        <Plus className={styles.createIcon} aria-hidden="true" />
        <SlottedText slot="label">{label}</SlottedText>
      </DropdownItem>
    );
  }

  return (
    <DropdownItem id={item.id} textValue={item.label}>
      {item.label}
    </DropdownItem>
  );
}
