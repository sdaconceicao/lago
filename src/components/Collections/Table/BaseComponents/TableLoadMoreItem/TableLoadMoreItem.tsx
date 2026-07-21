"use client";
import clsx from "clsx";
import {
  TableLoadMoreItem as AriaTableLoadMoreItem,
  type TableLoadMoreItemProps,
} from "react-aria-components/Table";
import { ProgressCircle } from "@/components/Status/ProgressCircle/ProgressCircle";
import styles from "./TableLoadMoreItem.module.css";

export type { TableLoadMoreItemProps };

export function TableLoadMoreItem(props: TableLoadMoreItemProps) {
  return (
    <AriaTableLoadMoreItem
      {...props}
      className={
        props.className ??
        clsx("react-aria-TableLoadingIndicator", styles.tableLoadingIndicator)
      }
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ProgressCircle isIndeterminate aria-label="Loading more..." />
      </div>
    </AriaTableLoadMoreItem>
  );
}
