"use client";
import clsx from "clsx";
import {
  Table as AriaTable,
  type TableProps,
} from "react-aria-components/Table";
import { Cell, type CellProps } from "./BaseComponents/Cell";
import { Column, type ColumnProps } from "./BaseComponents/Column";
import { Row, type RowProps } from "./BaseComponents/Row";
import { TableBody, type TableBodyProps } from "./BaseComponents/TableBody";
import {
  TableFooter,
  type TableFooterProps,
} from "./BaseComponents/TableFooter";
import {
  TableHeader,
  type TableHeaderProps,
} from "./BaseComponents/TableHeader";
import {
  TableLoadMoreItem,
  type TableLoadMoreItemProps,
} from "./BaseComponents/TableLoadMoreItem";
import styles from "./Table.module.css";

export function Table(props: TableProps) {
  return (
    <AriaTable
      {...props}
      className={props.className ?? clsx("react-aria-Table", styles.table)}
    />
  );
}

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Footer = TableFooter;
Table.Column = Column;
Table.Row = Row;
Table.Cell = Cell;
Table.LoadMoreItem = TableLoadMoreItem;

export {
  Cell,
  Column,
  Row,
  TableBody,
  TableFooter,
  TableHeader,
  TableLoadMoreItem,
};
export type {
  CellProps,
  ColumnProps,
  RowProps,
  TableBodyProps,
  TableFooterProps,
  TableHeaderProps,
  TableLoadMoreItemProps,
  TableProps,
};
