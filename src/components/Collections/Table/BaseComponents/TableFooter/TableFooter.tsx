"use client";
import clsx from "clsx";
import {
  TableFooter as AriaTableFooter,
  type TableFooterProps,
} from "react-aria-components/Table";
import styles from "./TableFooter.module.css";

export type { TableFooterProps };

export function TableFooter<T>(props: TableFooterProps<T>) {
  return (
    <AriaTableFooter
      {...props}
      className={
        props.className ?? clsx("react-aria-TableFooter", styles.tableFooter)
      }
    />
  );
}
