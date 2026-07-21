"use client";
import clsx from "clsx";
import {
  Column as AriaColumn,
  TableHeader as AriaTableHeader,
  Collection,
  type TableHeaderProps,
  useTableOptions,
} from "react-aria-components/Table";
import { Checkbox } from "@/components/Inputs/Checkbox/CheckboxItem/Checkbox";
import utils from "@/styles/utilities.module.css";
import columnStyles from "../Column/Column.module.css";
import styles from "./TableHeader.module.css";

export type { TableHeaderProps };

export function TableHeader<T>({
  columns,
  children,
  ...otherProps
}: TableHeaderProps<T>) {
  const { selectionBehavior, selectionMode, allowsDragging } =
    useTableOptions();

  return (
    <AriaTableHeader
      {...otherProps}
      className={
        otherProps.className ??
        clsx("react-aria-TableHeader", styles.tableHeader)
      }
    >
      {/* Add extra columns for drag and drop and selection. */}
      {allowsDragging && (
        <AriaColumn
          width={20}
          minWidth={20}
          style={{ width: 20 }}
          className={clsx(
            "react-aria-Column",
            utils.buttonBase,
            columnStyles.column
          )}
        />
      )}
      {selectionBehavior === "toggle" && (
        <AriaColumn
          width={32}
          minWidth={32}
          style={{ width: 32 }}
          className={clsx(
            "react-aria-Column",
            utils.buttonBase,
            columnStyles.column
          )}
        >
          {selectionMode === "multiple" && <Checkbox slot="selection" />}
        </AriaColumn>
      )}
      <Collection items={columns}>{children}</Collection>
    </AriaTableHeader>
  );
}
