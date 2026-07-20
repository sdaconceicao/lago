"use client";
import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Group } from "react-aria-components/Group";
import {
  Column as AriaColumn,
  type ColumnProps as AriaColumnProps,
  ColumnResizer,
} from "react-aria-components/Table";
import utils from "@/styles/utilities.module.css";
import styles from "../Table.module.css";

export interface ColumnProps extends AriaColumnProps {
  /** Enables an interactive resizer handle on the column's trailing edge. */
  allowsResizing?: boolean;
}

export function Column(
  props: Omit<ColumnProps, "children"> & { children?: React.ReactNode }
) {
  return (
    <AriaColumn
      {...props}
      className={clsx("react-aria-Column", utils.buttonBase, styles.column)}
    >
      {({ allowsSorting, sortDirection }) => (
        <div className={clsx("column-header", styles.columnHeader)}>
          <Group
            role="presentation"
            tabIndex={-1}
            className={clsx("column-name", styles.columnName)}
          >
            {props.children}
          </Group>
          {allowsSorting && (
            <span
              aria-hidden="true"
              className={clsx("sort-indicator", styles.sortIndicator)}
            >
              {sortDirection === "ascending" ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </span>
          )}
          {props.allowsResizing && (
            <ColumnResizer
              className={clsx("react-aria-ColumnResizer", styles.columnResizer)}
            />
          )}
        </div>
      )}
    </AriaColumn>
  );
}
