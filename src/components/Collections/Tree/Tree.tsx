"use client";
import clsx from "clsx";
import { ChevronRight, GripVertical } from "lucide-react";
import {
  Tree as AriaTree,
  TreeHeader as AriaTreeHeader,
  TreeItem as AriaTreeItem,
  TreeItemContent as AriaTreeItemContent,
  type TreeItemProps as AriaTreeItemProps,
  TreeLoadMoreItem as AriaTreeLoadMoreItem,
  TreeSection as AriaTreeSection,
  Button,
  type TreeItemContentProps,
  type TreeItemContentRenderProps,
  type TreeLoadMoreItemProps,
  type TreeProps,
} from "react-aria-components/Tree";
import { ProgressCircle } from "@/components/Feedback/ProgressCircle/ProgressCircle";
import { Checkbox } from "@/components/Inputs/Checkbox/CheckboxItem/Checkbox";
import styles from "./Tree.module.css";

export function Tree<T>(props: TreeProps<T>) {
  return (
    <AriaTree
      {...props}
      className={clsx("react-aria-Tree", styles.tree, props.className)}
    />
  );
}

export function TreeItemContent(
  props: Omit<TreeItemContentProps, "children"> & { children?: React.ReactNode }
) {
  return (
    <AriaTreeItemContent>
      {({
        selectionBehavior,
        selectionMode,
        allowsDragging,
      }: TreeItemContentRenderProps) => (
        <>
          {allowsDragging && (
            <Button slot="drag">
              <GripVertical size={16} />
            </Button>
          )}
          {selectionBehavior === "toggle" && selectionMode !== "none" && (
            <Checkbox slot="selection" />
          )}
          <Button slot="chevron">
            <ChevronRight />
          </Button>
          {props.children}
        </>
      )}
    </AriaTreeItemContent>
  );
}

export interface TreeItemProps extends Partial<AriaTreeItemProps> {
  title?: React.ReactNode;
}

export function TreeItem(props: TreeItemProps) {
  const textValue = typeof props.title === "string" ? props.title : "";
  return (
    <AriaTreeItem
      textValue={textValue}
      {...props}
      className={clsx("react-aria-TreeItem", styles.treeItem, props.className)}
    >
      {props.title != null ? (
        <>
          <TreeItemContent>{props.title}</TreeItemContent>
          {props.children}
        </>
      ) : (
        props.children
      )}
    </AriaTreeItem>
  );
}

export function TreeLoadMoreItem(props: TreeLoadMoreItemProps) {
  return (
    <AriaTreeLoadMoreItem
      {...props}
      className={clsx(
        "react-aria-TreeLoader",
        styles.treeLoader,
        props.className
      )}
    >
      <ProgressCircle isIndeterminate aria-label="Loading more..." />
    </AriaTreeLoadMoreItem>
  );
}

export function TreeSection(
  props: React.ComponentProps<typeof AriaTreeSection>
) {
  return (
    <AriaTreeSection
      {...props}
      className={clsx(
        "react-aria-TreeSection",
        styles.treeSection,
        props.className
      )}
    />
  );
}

export function TreeHeader(props: React.ComponentProps<typeof AriaTreeHeader>) {
  return (
    <AriaTreeHeader
      {...props}
      className={clsx(
        "react-aria-TreeHeader",
        styles.treeHeader,
        props.className
      )}
    />
  );
}

export type {
  TreeItemContentProps,
  TreeItemContentRenderProps,
  TreeLoadMoreItemProps,
  TreeProps,
};
