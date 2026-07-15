"use client";
import clsx from "clsx";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import { Group } from "react-aria-components/Group";
import {
  Cell as AriaCell,
  Column as AriaColumn,
  type ColumnProps as AriaColumnProps,
  Row as AriaRow,
  Table as AriaTable,
  TableBody as AriaTableBody,
  TableFooter as AriaTableFooter,
  TableHeader as AriaTableHeader,
  TableLoadMoreItem as AriaTableLoadMoreItem,
  Button,
  type CellProps,
  Collection,
  ColumnResizer,
  type RowProps,
  type TableBodyProps,
  type TableFooterProps,
  type TableHeaderProps,
  type TableLoadMoreItemProps,
  type TableProps,
  useTableOptions,
} from "react-aria-components/Table";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { Checkbox } from "../Checkbox/Checkbox";
import { ProgressCircle } from "../ProgressCircle/ProgressCircle";
import utils from "../../styles/utilities.module.css";
import styles from "./Table.module.css";

export function Table(props: TableProps) {
  return (
    <AriaTable
      {...props}
      className={props.className ?? clsx("react-aria-Table", styles.table)}
    />
  );
}

interface ColumnProps extends AriaColumnProps {
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
          className={clsx("react-aria-Column", utils.buttonBase, styles.column)}
        />
      )}
      {selectionBehavior === "toggle" && (
        <AriaColumn
          width={32}
          minWidth={32}
          style={{ width: 32 }}
          className={clsx("react-aria-Column", utils.buttonBase, styles.column)}
        >
          {selectionMode === "multiple" && <Checkbox slot="selection" />}
        </AriaColumn>
      )}
      <Collection items={columns}>{children}</Collection>
    </AriaTableHeader>
  );
}

export function Row<T>({ id, columns, children, ...otherProps }: RowProps<T>) {
  const { selectionBehavior, allowsDragging } = useTableOptions();

  return (
    <AriaRow
      id={id}
      {...otherProps}
      className={otherProps.className ?? clsx("react-aria-Row", styles.row)}
    >
      {allowsDragging && (
        <Cell>
          <Button
            slot="drag"
            className={clsx("drag-button", styles.dragButton)}
          >
            <GripVertical />
          </Button>
        </Cell>
      )}
      {selectionBehavior === "toggle" && (
        <Cell>
          <Checkbox slot="selection" />
        </Cell>
      )}
      <Collection items={columns}>{children}</Collection>
    </AriaRow>
  );
}

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

export function Cell(props: CellProps) {
  return (
    <AriaCell
      {...props}
      className={props.className ?? clsx("react-aria-Cell", styles.cell)}
    >
      {composeRenderProps(
        props.children,
        (children, { hasChildItems, isTreeColumn }) => (
          <>
            {isTreeColumn && hasChildItems && (
              <Button
                slot="chevron"
                className={clsx("react-aria-Button", styles.chevronButton)}
              >
                <ChevronRight />
              </Button>
            )}
            {children}
          </>
        )
      )}
    </AriaCell>
  );
}

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
