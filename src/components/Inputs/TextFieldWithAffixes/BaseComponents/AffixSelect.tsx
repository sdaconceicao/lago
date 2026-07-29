"use client";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect } from "react";
import { Button } from "react-aria-components/Button";
import {
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue,
} from "react-aria-components/Select";
import { DropdownListBox } from "@/components/Collections/ListBox/ListBox";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
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
 * segment. It draws no field surface of its own — the field provides the inset —
 * so the trigger reads as part of the field and only paints a hover background.
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
  const { size: fieldSize, reportValue } = useAffixContext();
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
      onSelectionChange={handleSelectionChange}
      className={clsx("react-aria-Select", styles.select, className)}
    >
      <Button className={clsx("react-aria-Button", styles.trigger)}>
        <SelectValue className={styles.value} />
        <ChevronDown aria-hidden="true" className={styles.chevron} />
      </Button>
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
