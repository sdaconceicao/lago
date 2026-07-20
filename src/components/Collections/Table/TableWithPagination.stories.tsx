import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { Cell, Column, Row, TableBody, TableHeader } from "./Table";
import { TableWithPagination } from "./TableWithPagination";

interface Person {
  id: number;
  name: string;
  role: string;
  location: string;
}

const roles = ["Engineer", "Designer", "Manager", "Analyst", "Support"];
const locations = ["Remote", "New York", "London", "Berlin", "Tokyo"];

const people: Person[] = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  role: roles[i % roles.length],
  location: locations[i % locations.length],
}));

/**
 * Renders the header and body for the current page. The header columns and the
 * row/cell content are composed here as children — TableWithPagination only
 * supplies the current page's items and wires up the pagination control.
 */
const renderContent = (pageItems: Person[]) => (
  <>
    <TableHeader>
      <Column id="name" isRowHeader>
        Name
      </Column>
      <Column id="role">Role</Column>
      <Column id="location">Location</Column>
    </TableHeader>
    <TableBody items={pageItems}>
      {(person) => (
        <Row id={person.id}>
          <Cell>{person.name}</Cell>
          <Cell>{person.role}</Cell>
          <Cell>{person.location}</Cell>
        </Row>
      )}
    </TableBody>
  </>
);

const meta: Meta<typeof TableWithPagination<Person>> = {
  title: "Collections/TableWithPagination",
  component: TableWithPagination,
  args: {
    onPageChange: fn(),
    onRowAction: fn(),
    onSelectionChange: fn(),
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A Table composed with a Pagination control. The full data set is passed via `items` and sliced internally according to `rowsPerPage`. The table content — TableHeader/Column and TableBody/Row/Cell — is still composed by the caller through a render function that receives the current page's items. Supports both uncontrolled (defaultPage) and controlled (page + onPageChange) paging, and forwards all Table props such as selection and sorting.",
      },
    },
  },
  tags: ["autodocs"],
  render: (args) => (
    <TableWithPagination<Person> {...args}>
      {(pageItems) => {
        return (
          <>
            <TableHeader>
              <Column id="name" isRowHeader>
                Name
              </Column>
              <Column id="role">Role</Column>
              <Column id="location">Location</Column>
            </TableHeader>
            <TableBody items={pageItems}>
              {(person) => (
                <Row id={person.id}>
                  <Cell>{person.name}</Cell>
                  <Cell>{person.role}</Cell>
                  <Cell>{person.location}</Cell>
                </Row>
              )}
            </TableBody>
          </>
        );
      }}
    </TableWithPagination>
  ),
};

export default meta;
type Story = StoryObj<typeof TableWithPagination<Person>>;

export const Default: Story = {
  args: {
    "aria-label": "Team members",
    items: people,
    rowsPerPage: 10,
  },
};

export const RowsPerPage: Story = {
  args: {
    "aria-label": "Team members",
    items: people,
    rowsPerPage: 5,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The rowsPerPage prop controls how many rows appear on each page and, in turn, how many pages the Pagination control offers. Here five rows are shown per page.",
      },
    },
  },
};

export const WithSelection: Story = {
  args: {
    "aria-label": "Team members",
    items: people,
    rowsPerPage: 8,
    selectionMode: "multiple",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Table props such as selectionMode are forwarded to the underlying Table, so row selection works alongside pagination.",
      },
    },
  },
};

export const SinglePage: Story = {
  args: {
    "aria-label": "Team members",
    items: people.slice(0, 6),
    rowsPerPage: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          "When every row fits on a single page, the Pagination control is hidden automatically.",
      },
    },
  },
};
