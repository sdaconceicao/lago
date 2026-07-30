"use client";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect } from "react";
import {
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue,
} from "react-aria-components/Select";
import { DropdownListBox } from "@/components/Collections/ListBox/ListBox";
import {
  FieldButton,
  type FieldSize,
} from "@/components/Inputs/FormComponents/index";
import { Popover } from "@/components/Overlays/Popover/Popover";
import { type AffixKey, useAffixContext } from "../AffixContext";
import styles from "./AffixSelect.module.css";

export interface AffixSelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, "children" | "className"> {
  /**
   * Accessible name for the dropdown. Required: the segment has no visible
   * label of its own, so without one the control is unnamed to screen readers.
   */
  "aria-label": string;
  /** Options to render from data. Omit when passing static option nodes. */
  items?: Iterable<T>;
  /** The list options: static nodes or a render function for each item. */
  children: React.ReactNode | ((item: T) => React.ReactNode);
  /**
   * Field size used for the portaled dropdown. Defaults to the enclosing
   * field's size, so it rarely needs to be set.
   */
  size?: FieldSize;
  /** CSS class name applied to the dropdown root, merged with the defaults. */
  className?: string;
}

/**
 * A dropdown sized and styled to sit in a TextFieldWithAffixes prefix or suffix
 * segment. Its trigger is a FieldButton, so it reads as the same tinted control
 * as the Select chevron and the DatePicker calendar button — a button sitting
 * inside the field, rather than a segment of the field surface.
 *
 * Selecting an option fires the enclosing field's `onChange` alongside this
 * dropdown's own `onSelectionChange`, so a consumer can read the text and both
 * affixes from one handler instead of stitching callbacks together.
 */
export function AffixSelect<T extends object>({
  items,
  children,
  size,
  className,
  onSelectionChange,
  ...props
}: AffixSelectProps<T>) {
  const {
    size: fieldSize,
    isDisabled: isFieldDisabled,
    reportValue,
  } = useAffixContext();
  const startingKey = props.selectedKey ?? props.defaultSelectedKey ?? null;

  // Announce the selection this dropdown mounted with, so the field's onChange
  // payload is complete before the user ever opens it. The field treats a slot's
  // first report as seeding rather than a change, so this fires no callback.
  useEffect(() => {
    reportValue?.(startingKey);
  }, [reportValue, startingKey]);

  const handleSelectionChange = useCallback(
    (key: AffixKey) => {
      reportValue?.(key);
      onSelectionChange?.(key);
    },
    [reportValue, onSelectionChange]
  );

  return (
    <AriaSelect
      {...props}
      // A disabled field has to disable its dropdowns explicitly: react-aria
      // disables the input over context, but this Select is a control of its
      // own and would otherwise still open. An explicit prop still wins, so a
      // dropdown can be disabled on its own inside an enabled field.
      isDisabled={props.isDisabled ?? isFieldDisabled}
      onSelectionChange={handleSelectionChange}
      className={clsx("react-aria-Select", styles.select, className)}
    >
      <FieldButton className={styles.trigger}>
        <SelectValue className={styles.value} />
        <ChevronDown aria-hidden="true" className={styles.chevron} />
      </FieldButton>
      {/* The popover is portaled to the document body, so it cannot inherit the
          --field-* scope from the field: carry the size across explicitly. */}
      <Popover
        hideArrow
        data-field-size={size ?? fieldSize}
        className={styles.popover}
      >
        <DropdownListBox items={items}>{children}</DropdownListBox>
      </Popover>
    </AriaSelect>
  );
}
