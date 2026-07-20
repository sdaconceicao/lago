import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Cell, Column, Row, TableBody, TableHeader } from "./Table";
import { TableWithPagination } from "./TableWithPagination";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

interface File {
  id: string;
  name: string;
  type: string;
}

const makeItems = (count: number): File[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `file-${i + 1}`,
    name: `File ${i + 1}`,
    type: i % 2 === 0 ? "Folder" : "Document",
  }));

const renderTable = (props = {}) =>
  render(
    <TableWithPagination<File>
      aria-label="Files"
      items={makeItems(25)}
      rowsPerPage={10}
      {...props}
    >
      {(pageItems) => (
        <>
          <TableHeader>
            <Column id="name" isRowHeader>
              Name
            </Column>
            <Column id="type">Type</Column>
          </TableHeader>
          <TableBody items={pageItems} renderEmptyState={() => "No results."}>
            {(item) => (
              <Row id={item.id}>
                <Cell>{item.name}</Cell>
                <Cell>{item.type}</Cell>
              </Row>
            )}
          </TableBody>
        </>
      )}
    </TableWithPagination>
  );

describe("TableWithPagination", () => {
  it("renders only the first page of rows", () => {
    renderTable();

    expect(
      screen.getByRole("rowheader", { name: "File 1" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "File 10" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("rowheader", { name: "File 11" })
    ).not.toBeInTheDocument();
  });

  it("renders a pagination control with the right number of pages", () => {
    renderTable();

    // 25 items / 10 per page = 3 pages.
    expect(
      screen.getByRole("navigation", { name: "Table pagination" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go to page 3" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Go to page 4" })
    ).not.toBeInTheDocument();
  });

  it("navigates to another page and swaps the visible rows (uncontrolled)", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("button", { name: "Go to page 2" }));

    expect(
      screen.getByRole("rowheader", { name: "File 11" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("rowheader", { name: "File 1" })
    ).not.toBeInTheDocument();
  });

  it("navigates with the next control", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("button", { name: "Go to next page" }));

    expect(
      screen.getByRole("rowheader", { name: "File 11" })
    ).toBeInTheDocument();
  });

  it("respects the rowsPerPage prop", () => {
    renderTable({ rowsPerPage: 5 });

    expect(
      screen.getByRole("rowheader", { name: "File 5" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("rowheader", { name: "File 6" })
    ).not.toBeInTheDocument();
    // 25 / 5 = 5 pages.
    expect(
      screen.getByRole("button", { name: "Go to page 5" })
    ).toBeInTheDocument();
  });

  it("supports controlled paging via page and onPageChange", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderTable({ page: 2, onPageChange });

    // Controlled: page 2 rows are shown.
    expect(
      screen.getByRole("rowheader", { name: "File 11" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Go to page 3" }));

    // The callback fires, but the visible page does not change until the
    // controlling parent updates the page prop.
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(
      screen.getByRole("rowheader", { name: "File 11" })
    ).toBeInTheDocument();
  });

  it("marks the current page for assistive technology", () => {
    renderTable();

    expect(
      screen.getByRole("button", { name: "Go to page 1" })
    ).toHaveAttribute("aria-current", "page");
  });

  it("hides the pagination control when everything fits on one page", () => {
    renderTable({ items: makeItems(4) });

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "File 4" })
    ).toBeInTheDocument();
  });

  it("hides the pagination control when hidePagination is set", () => {
    renderTable({ hidePagination: true });

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    // Still only the first page is rendered.
    expect(
      screen.queryByRole("rowheader", { name: "File 11" })
    ).not.toBeInTheDocument();
  });

  it("renders an empty state when there are no items", () => {
    renderTable({ items: [] });

    expect(screen.getByText("No results.")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
