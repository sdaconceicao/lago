"use client";
import clsx from "clsx";
import {
  TableBody as AriaTableBody,
  type TableBodyProps,
} from "react-aria-components/Table";
import styles from "./TableBody.module.css";

export type { TableBodyProps };

export function TableBody<T>(props: TableBodyProps<T>) {
  return (
    <AriaTableBody
      {...props}
      className={
        props.className ?? clsx("react-aria-TableBody", styles.tableBody)
      }
    />
  );
}
