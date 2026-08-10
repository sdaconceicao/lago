"use client";
import { DropdownListBox } from "@/components/Collections/ListBox/ListBox";

export interface MultiSelectListBoxProps<T> {
  /** The list options: static nodes or a render function for each item. */
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

/**
 * The MultiSelect's dropdown list. Holds nothing but the options: the selection
 * controls are siblings of this listbox rather than members of its collection,
 * so the empty state below still speaks for the options alone.
 */
export function MultiSelectListBox<T>({
  children,
}: MultiSelectListBoxProps<T>) {
  return (
    <DropdownListBox renderEmptyState={() => "No results found."}>
      {children}
    </DropdownListBox>
  );
}
