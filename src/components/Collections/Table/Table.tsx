"use client";
import clsx from "clsx";
import {
  Table as AriaTable,
  type TableProps,
} from "react-aria-components/Table";
import { Cell, type CellProps } from "./BaseComponents/Cell/Cell";
import { Column, type ColumnProps } from "./BaseComponents/Column/Column";
import {
  defaultResultsTemplate,
  ResultsCount,
  type ResultsCountInfo,
  type ResultsCountProps,
} from "./BaseComponents/ResultsCount/ResultsCount";
import { Row, type RowProps } from "./BaseComponents/Row/Row";
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
Table.ResultsCount = ResultsCount;

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
  Cell,
  Column,
  defaultResultsTemplate,
  ResultsCount,
  Row,
  TableBody,
  TableFooter,
  TableHeader,
  TableLoadMoreItem,
};
