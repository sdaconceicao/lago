import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Cell, Column, Row, Table, TableBody, TableHeader } from "./Table";

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

const renderTable = (props = {}, columnProps = {}) =>
  render(
    <Table aria-label="Files" {...props}>
      <TableHeader>
        <Column id="name" isRowHeader {...columnProps}>
          Name
        </Column>
        <Column id="type">Type</Column>
      </TableHeader>
      <TableBody>
        <Row id="games">
          <Cell>Games</Cell>
          <Cell>File folder</Cell>
        </Row>
        <Row id="bootmgr">
          <Cell>bootmgr</Cell>
          <Cell>System file</Cell>
        </Row>
      </TableBody>
    </Table>
  );

describe("Table", () => {
  it("renders a grid with column headers, rows and cells", () => {
    renderTable();

    expect(screen.getByRole("grid", { name: "Files" })).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Name" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Type" })
    ).toBeInTheDocument();

    const gamesRow = screen.getByRole("row", { name: /Games/ });
    expect(within(gamesRow).getByRole("rowheader")).toHaveTextContent("Games");
    expect(within(gamesRow).getByRole("gridcell")).toHaveTextContent(
      "File folder"
    );
  });

  it("renders selection checkboxes for multiple selection mode", () => {
    renderTable({ selectionMode: "multiple" });

    expect(
      screen.getByRole("checkbox", { name: "Select All" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("selects a row via its checkbox and calls onSelectionChange", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderTable({ selectionMode: "multiple", onSelectionChange });

    const gamesRow = screen.getByRole("row", { name: /Games/ });
    await user.click(within(gamesRow).getByRole("checkbox"));

    expect(gamesRow).toHaveAttribute("aria-selected", "true");
    expect([...onSelectionChange.mock.calls[0][0]]).toEqual(["games"]);
  });

  it("selects all rows via the header checkbox", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderTable({ selectionMode: "multiple", onSelectionChange });

    await user.click(screen.getByRole("checkbox", { name: "Select All" }));

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange.mock.calls[0][0]).toBe("all");
  });

  it("calls onSortChange when a sortable column header is clicked", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    renderTable(
      { sortDescriptor: undefined, onSortChange },
      { allowsSorting: true }
    );

    await user.click(screen.getByRole("columnheader", { name: "Name" }));

    expect(onSortChange).toHaveBeenCalledTimes(1);
    expect(onSortChange).toHaveBeenCalledWith({
      column: "name",
      direction: "ascending",
    });
  });

  it("calls onRowAction when a row is actioned", async () => {
    const user = userEvent.setup();
    const onRowAction = vi.fn();
    renderTable({ onRowAction });

    await user.click(screen.getByRole("row", { name: /bootmgr/ }));

    expect(onRowAction).toHaveBeenCalledTimes(1);
    expect(onRowAction).toHaveBeenCalledWith("bootmgr");
  });

  it("marks disabled rows and prevents selecting them", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderTable({
      selectionMode: "multiple",
      disabledKeys: ["bootmgr"],
      onSelectionChange,
    });

    const row = screen.getByRole("row", { name: /bootmgr/ });
    expect(row).toHaveAttribute("aria-disabled", "true");

    await user.click(within(row).getByRole("checkbox"));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("supports keyboard navigation between rows", async () => {
    const user = userEvent.setup();
    renderTable({ selectionMode: "multiple" });

    await user.tab();
    expect(screen.getByRole("row", { name: /Games/ })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("row", { name: /bootmgr/ })).toHaveFocus();
  });
});
