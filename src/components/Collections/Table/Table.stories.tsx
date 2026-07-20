import { useState } from "react";
import type { Meta, StoryFn } from "@storybook/react";
import { fn } from "storybook/test";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableLoadMoreItem,
} from "./Table";
import tableStyles from "./Table.module.css";

const meta: Meta<typeof Table> = {
  component: Table,
  args: {
    onRowAction: fn(),
    onSelectionChange: fn(),
    onSortChange: fn(),
    onExpandedChange: fn(),
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A structured layout of columns and rows used to display and optionally select data. Tables support sortable columns, row and cell selection, and keyboard navigation. Columns, headers, and rows are composed from Column, TableHeader, Row, and Cell.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryFn<typeof Table>;

export const Example: Story = (args) => (
  <Table aria-label="Files" {...args}>
    <TableHeader>
      <Column isRowHeader>Name</Column>
      <Column>Type</Column>
      <Column>Date Modified</Column>
    </TableHeader>
    <TableBody>
      <Row>
        <Cell>Games</Cell>
        <Cell>File folder</Cell>
        <Cell>6/7/2020</Cell>
      </Row>
      <Row>
        <Cell>Program Files</Cell>
        <Cell>File folder</Cell>
        <Cell>4/7/2021</Cell>
      </Row>
      <Row>
        <Cell>bootmgr</Cell>
        <Cell>System file</Cell>
        <Cell>11/20/2010</Cell>
      </Row>
    </TableBody>
  </Table>
);

Example.args = {
  onRowAction: undefined,
  selectionMode: "multiple",
};

interface FileRow {
  id: number;
  name: string;
  type: string;
  date: string;
}

const PAGE_SIZE = 15;
const MAX_ROWS = 90;
const ROW_TYPES = [
  "File folder",
  "System file",
  "Text document",
  "Application",
];

const makeRows = (start: number, count: number): FileRow[] =>
  Array.from({ length: count }, (_, i) => {
    const id = start + i;
    return {
      id,
      name: `Item ${id}`,
      type: ROW_TYPES[id % ROW_TYPES.length],
      date: `6/${(id % 28) + 1}/2024`,
    };
  });

const LoadMoreExample = () => {
  const [rows, setRows] = useState<FileRow[]>(() => makeRows(1, PAGE_SIZE));
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = () => {
    if (isLoading || rows.length >= MAX_ROWS) return;
    setIsLoading(true);
    // Simulate a network request for the next page of results.
    setTimeout(() => {
      setRows((current) => [
        ...current,
        ...makeRows(current.length + 1, PAGE_SIZE),
      ]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div
      className={tableStyles.scrollContainer}
      style={{ maxHeight: 320, width: 520 }}
    >
      <Table aria-label="Files">
        <TableHeader>
          <Column isRowHeader>Name</Column>
          <Column>Type</Column>
          <Column>Date Modified</Column>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.id} id={row.id}>
              <Cell>{row.name}</Cell>
              <Cell>{row.type}</Cell>
              <Cell>{row.date}</Cell>
            </Row>
          ))}
          {rows.length < MAX_ROWS && (
            <TableLoadMoreItem onLoadMore={loadMore} isLoading={isLoading} />
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export const LoadMore: StoryFn = () => <LoadMoreExample />;
LoadMore.parameters = {
  layout: "centered",
  docs: {
    description: {
      story:
        "Infinite scroll with TableLoadMoreItem inside a scroll container. The column header stays pinned to the top while the rows scroll; when the sentinel row at the end scrolls into view it calls onLoadMore to fetch the next page, rendering a loading spinner while isLoading is true. Scroll to the bottom of the list to load more rows (up to 90).",
    },
  },
};

export const Scrolling: StoryFn = () => {
  const rows = makeRows(1, 40);
  return (
    <div
      className={tableStyles.scrollContainer}
      style={{ maxHeight: 320, width: 520 }}
    >
      <Table aria-label="Files">
        <TableHeader>
          <Column isRowHeader>Name</Column>
          <Column>Type</Column>
          <Column>Date Modified</Column>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.id} id={row.id}>
              <Cell>{row.name}</Cell>
              <Cell>{row.type}</Cell>
              <Cell>{row.date}</Cell>
            </Row>
          ))}
        </TableBody>
        <TableFooter>
          <Row>
            <Cell>{rows.length} items</Cell>
            <Cell>&nbsp;</Cell>
            <Cell>&nbsp;</Cell>
          </Row>
        </TableFooter>
      </Table>
    </div>
  );
};
Scrolling.parameters = {
  layout: "centered",
  docs: {
    description: {
      story:
        "Wrapping a Table in the scroll container constrains its height and scrolls the body between a pinned column header and a pinned TableFooter, instead of scrolling the whole table. Give the wrapper a max-height (or height) to enable it.",
    },
  },
};
