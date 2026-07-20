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

const meta: Meta<typeof TableWithPagination<Person>> = {
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
          "When every row fits on a single page, the Pagination control is hidden — but the footer still shows the results summary.",
      },
    },
  },
};

export const CustomResultsSummary: Story = {
  args: {
    "aria-label": "Team members",
    items: people,
    rowsPerPage: 10,
    resultsTemplate: ({ from, to, total }) => (
      <>
        <strong>
          {from}–{to}
        </strong>{" "}
        of {total} people
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "The footer's results summary is templatable via the resultsTemplate prop, which receives the { from, to, total } values and can return any ReactNode. The default renders 'Showing x to y of z results'.",
      },
    },
  },
};

export const HiddenResults: Story = {
  args: {
    "aria-label": "Team members",
    items: people,
    rowsPerPage: 10,
    hideResults: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Set hideResults to omit the results summary from the footer, leaving only the pagination control.",
      },
    },
  },
};

export const ScrollableBody: Story = {
  args: {
    "aria-label": "Team members",
    items: people,
    rowsPerPage: 25,
    maxHeight: 300,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Set maxHeight to bound the table body. When a page has more rows than fit, the rows scroll within that height while the column header stays pinned to the top and the footer (results summary + pagination) stays fixed below — the scroll happens between the header and the footer instead of the whole table scrolling.",
      },
    },
  },
};
