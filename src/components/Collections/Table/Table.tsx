"use client";
import clsx from "clsx";
import {
  Table as AriaTable,
  type TableProps,
} from "react-aria-components/Table";
import { type CellProps, TableCell } from "./BaseComponents/Cell/Cell";
import { type ColumnProps, TableColumn } from "./BaseComponents/Column/Column";
import {
  defaultResultsTemplate,
  type ResultsCountInfo,
  type ResultsCountProps,
  TableResultsCount,
} from "./BaseComponents/ResultsCount/ResultsCount";
import { type RowProps, TableRow } from "./BaseComponents/Row/Row";
import {
  TableBody,
  type TableBodyProps,
} from "./BaseComponents/TableBody/TableBody";
import {
  TableFooter,
  type TableFooterProps,
} from "./BaseComponents/TableFooter/TableFooter";
import {
  TableHeader,
  type TableHeaderProps,
} from "./BaseComponents/TableHeader/TableHeader";
import {
  TableLoadMoreItem,
  type TableLoadMoreItemProps,
} from "./BaseComponents/TableLoadMoreItem/TableLoadMoreItem";
import styles from "./Table.module.css";

export function Table(props: TableProps) {
  return (
    <AriaTable
      {...props}
      className={clsx("react-aria-Table", styles.table, props.className)}
    />
  );
}

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Footer = TableFooter;
Table.Column = TableColumn;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.LoadMoreItem = TableLoadMoreItem;
Table.ResultsCount = TableResultsCount;

export type {
  CellProps,
  ColumnProps,
  ResultsCountInfo,
  ResultsCountProps,
  RowProps,
  TableBodyProps,
  TableFooterProps,
  TableHeaderProps,
  TableLoadMoreItemProps,
  TableProps,
};
export {
  defaultResultsTemplate,
  TableBody,
  TableCell,
  TableColumn,
  TableFooter,
  TableHeader,
  TableLoadMoreItem,
  TableResultsCount,
  TableRow,
};
