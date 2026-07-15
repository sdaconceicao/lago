"use client";
import type { ListBoxProps } from "react-aria-components/ListBox";
import { DropdownListBox } from "../../ListBox/ListBox";

/** The dropdown list box for the MultiSelect. */
export function MultiSelectListBox<T>(props: ListBoxProps<T>) {
  return <DropdownListBox {...props} />;
}
