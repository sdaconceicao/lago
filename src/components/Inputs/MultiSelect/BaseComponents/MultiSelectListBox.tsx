"use client";
import { type MouseEvent, useCallback, useContext } from "react";
import { Collection } from "react-aria-components/Collection";
import { ComboBoxStateContext } from "react-aria-components/ComboBox";
import { DropdownListBox } from "@/components/Collections/ListBox/ListBox";
import { applySelectionAction } from "@/components/Inputs/MultiSelect/MultiSelect.utils";
import { MultiSelectToolbar } from "./MultiSelectToolbar";

export interface MultiSelectListBoxProps<T> {
  /** The list options: static nodes or a render function for each item. */
  children: React.ReactNode | ((item: T) => React.ReactNode);
  /** The items the render function is called for, when children is a function. */
  items?: Iterable<T>;
  /** Whether to render the "select all" / "select none" toolbar above the options. */
  allowsSelectAll?: boolean;
  /** Label for the control that checks every option on offer. */
  selectAllLabel: string;
  /** Label for the control that unchecks every option on offer. */
  selectNoneLabel: string;
}

/**
 * The MultiSelect's dropdown list. Rendered inside the ComboBox so it can reach
 * the field's state, which is what the selection controls act on.
 */
export function MultiSelectListBox<T>({
  children,
  items,
  allowsSelectAll,
  selectAllLabel,
  selectNoneLabel,
}: MultiSelectListBoxProps<T>) {
  const state = useContext(ComboBoxStateContext);

  // Pressing a selection control is handled here, on the listbox, rather than
  // by the control itself. A ComboBox renders its children twice — once into a
  // hidden tree to build the collection, once for real — and an option's props
  // are captured from the hidden pass, which sits outside the state provider,
  // so a handler on the option would close over no state at all. Delegating to
  // the listbox keeps the live state in reach. Every option carries data-key.
  //
  // The capture phase is what makes the delegation work: react-aria's press
  // handling stops a click from propagating out of the option it lands on.
  const onClickCapture = useCallback(
    (event: MouseEvent) => {
      if (!state) return;
      const option = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-key]"
      );
      applySelectionAction(state, option?.dataset.key);
    },
    [state]
  );

  return (
    <DropdownListBox
      renderEmptyState={() => "No results found."}
      onClickCapture={allowsSelectAll ? onClickCapture : undefined}
      // data-attr rather than className: DropdownListBox does not merge
      // caller classNames into its own. See MultiSelectToolbar.module.css.
      data-multi-select-toolbar={allowsSelectAll || undefined}
    >
      {allowsSelectAll ? (
        <>
          <MultiSelectToolbar
            selectAllLabel={selectAllLabel}
            selectNoneLabel={selectNoneLabel}
          />
          {/* Static controls beside dynamic options: wrap the options in their
              own Collection so a render function is still called per item.
              Items are supplied here (not on the ComboBox) whenever the
              toolbar is on — see MultiSelect for why. Static children pass
              straight through. */}
          <Collection items={items}>{children}</Collection>
        </>
      ) : (
        children
      )}
    </DropdownListBox>
  );
}
