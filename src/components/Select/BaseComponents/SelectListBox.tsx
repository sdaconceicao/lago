"use client";
import clsx from "clsx";
import type { ListBoxProps } from "react-aria-components/ListBox";
import { DropdownListBox } from "../../ListBox/ListBox";
import styles from "./SelectListBox.module.css";

/** The dropdown list box for the Select. */
export function SelectListBox<T>(props: ListBoxProps<T>) {
  return (
    <DropdownListBox
      {...props}
      className={clsx(styles.listBox, props.className)}
    />
  );
}
