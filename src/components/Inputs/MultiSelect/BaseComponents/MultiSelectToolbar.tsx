"use client";
import clsx from "clsx";
import type { Key } from "react-aria-components/Collection";
import type { ListBoxItemProps } from "react-aria-components/ListBox";
import { ListBoxItem } from "@/components/Collections/ListBox/ListBox";
import {
  SELECT_ALL_KEY,
  SELECT_NONE_KEY,
} from "@/components/Inputs/MultiSelect/MultiSelect.utils";
import styles from "./MultiSelectToolbar.module.css";

/**
 * `ListBoxItem` props plus react-aria's per-option `disabledBehavior`, which
 * its selection manager and keyboard delegate both read but its public prop
 * types leave out. See the note on `controlProps` below for what it buys.
 */
interface SelectionControlProps extends ListBoxItemProps {
  disabledBehavior?: "all" | "selection";
}

/**
 * `isDisabled` is what takes a control out of the selection: react-aria will
 * not let a disabled option be selected, so pressing one can never check it or
 * add its key to the value. On its own that would also drop the option out of
 * the arrow key order and grey it out, which is where `disabledBehavior` comes
 * in — per option, `"selection"` means "not selectable, still an interactive
 * option", so the control stays navigable, hoverable and pressable.
 */
const controlProps: SelectionControlProps = {
  isDisabled: true,
  disabledBehavior: "selection",
};

function SelectionControl({ id, children }: { id: Key; children: string }) {
  return (
    <ListBoxItem
      {...controlProps}
      id={id}
      className={clsx("multi-select-control", styles.control)}
    >
      {children}
    </ListBoxItem>
  );
}

export interface MultiSelectToolbarProps {
  /** Label for the control that checks every option on offer. */
  selectAllLabel: string;
  /** Label for the control that unchecks every option on offer. */
  selectNoneLabel: string;
}

/**
 * The MultiSelect dropdown's selection controls. They are ordinary options of
 * the listbox — first in the collection, so ArrowDown reaches them ahead of the
 * checkboxes and no separate tab stop is introduced — laid out as a sticky
 * toolbar row above the options.
 *
 * They are intentionally not wrapped in a `ListBoxSection`: react-stately's
 * ComboBox filter rebuilds sections with `{...node, childNodes}`, and under
 * React 19 that path throws when a control's label matches the filter
 * (e.g. typing "a" then Backspace with "Select all" visible), which aborts the
 * input update and freezes the field.
 *
 * Pressing one is handled by the listbox rather than by the option itself; see
 * MultiSelectListBox for why.
 */
export function MultiSelectToolbar({
  selectAllLabel,
  selectNoneLabel,
}: MultiSelectToolbarProps) {
  return (
    <>
      <SelectionControl id={SELECT_ALL_KEY}>{selectAllLabel}</SelectionControl>
      <SelectionControl id={SELECT_NONE_KEY}>
        {selectNoneLabel}
      </SelectionControl>
    </>
  );
}
