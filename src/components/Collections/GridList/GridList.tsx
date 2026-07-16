"use client";
import clsx from "clsx";
import { GripVertical } from "lucide-react";
import {
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  GridListLoadMoreItem as AriaGridListLoadMoreItem,
  Button,
  GridListHeader,
  type GridListItemProps,
  type GridListLoadMoreItemProps,
  type GridListProps,
  GridListSection,
  Text,
} from "react-aria-components/GridList";
import { Checkbox } from "@/components/Inputs/Checkbox/CheckboxItem/Checkbox";
import { ProgressCircle } from "@/components/Status/ProgressCircle/ProgressCircle";
import styles from "./GridList.module.css";

export function GridList<T>({
  children,
  layout = "grid",
  ...props
}: GridListProps<T>) {
  return (
    <AriaGridList
      {...props}
      layout={layout}
      className={
        props.className ?? clsx("react-aria-GridList", styles.gridList)
      }
    >
      {children}
    </AriaGridList>
  );
}

export function GridListItem({
  children,
  ...props
}: Omit<GridListItemProps, "children"> & {
  children?: React.ReactNode;
}) {
  const textValue = typeof children === "string" ? children : undefined;
  return (
    <AriaGridListItem
      textValue={textValue}
      {...props}
      className={
        props.className ?? clsx("react-aria-GridListItem", styles.gridListItem)
      }
    >
      {({ selectionMode, selectionBehavior, allowsDragging }) => (
        <>
          {/* Add elements for drag and drop and selection. */}
          {allowsDragging && (
            <Button slot="drag">
              <GripVertical size={16} />
            </Button>
          )}
          {selectionMode === "multiple" && selectionBehavior === "toggle" && (
            <Checkbox slot="selection" />
          )}
          {children}
        </>
      )}
    </AriaGridListItem>
  );
}

export function GridListLoadMoreItem(props: GridListLoadMoreItemProps) {
  return (
    <AriaGridListLoadMoreItem
      {...props}
      className={
        props.className ??
        clsx(
          "react-aria-GridListLoadingIndicator",
          styles.gridListLoadingIndicator
        )
      }
    >
      <ProgressCircle isIndeterminate aria-label="Loading more..." />
    </AriaGridListLoadMoreItem>
  );
}

export { GridListSection, GridListHeader, Text };
