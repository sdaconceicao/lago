import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GridList, GridListItem } from "./GridList";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const renderGridList = (props = {}) =>
  render(
    <GridList aria-label="Photos" {...props}>
      <GridListItem id="sunset">Desert Sunset</GridListItem>
      <GridListItem id="trail">Hiking Trail</GridListItem>
      <GridListItem id="lion">Lion</GridListItem>
    </GridList>
  );

describe("GridList", () => {
  it("renders a grid with an accessible name and one row per item", () => {
    renderGridList();

    expect(screen.getByRole("grid", { name: "Photos" })).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByRole("gridcell")).toHaveTextContent(
      "Desert Sunset"
    );
  });

  it("renders selection checkboxes for multiple selection mode", () => {
    renderGridList({ selectionMode: "multiple" });

    const rows = screen.getAllByRole("row");
    for (const row of rows) {
      expect(within(row).getByRole("checkbox")).toBeInTheDocument();
    }
  });

  it("toggles selection via the row checkbox and calls onSelectionChange", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderGridList({ selectionMode: "multiple", onSelectionChange });

    const trailRow = screen.getByRole("row", { name: "Hiking Trail" });
    await user.click(within(trailRow).getByRole("checkbox"));

    expect(trailRow).toHaveAttribute("aria-selected", "true");
    expect([...onSelectionChange.mock.calls[0][0]]).toEqual(["trail"]);

    await user.click(within(trailRow).getByRole("checkbox"));
    expect(trailRow).toHaveAttribute("aria-selected", "false");
    expect([...onSelectionChange.mock.calls[1][0]]).toEqual([]);
  });

  it("calls onAction when a row is actioned", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderGridList({ onAction });

    await user.click(screen.getByRole("row", { name: "Lion" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("lion");
  });

  it("marks disabled rows and prevents selecting them", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderGridList({
      selectionMode: "multiple",
      disabledKeys: ["lion"],
      onSelectionChange,
    });

    const lionRow = screen.getByRole("row", { name: "Lion" });
    expect(lionRow).toHaveAttribute("aria-disabled", "true");

    await user.click(lionRow);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("supports keyboard navigation between rows", async () => {
    const user = userEvent.setup();
    // jsdom has no layout, so use the stack layout whose keyboard
    // delegate follows collection order instead of element geometry.
    renderGridList({ selectionMode: "multiple", layout: "stack" });

    await user.tab();
    expect(screen.getByRole("row", { name: "Desert Sunset" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("row", { name: "Hiking Trail" })).toHaveFocus();
  });

  it("renders the empty state when there are no items", () => {
    render(
      <GridList
        aria-label="Photos"
        renderEmptyState={() => "No results found."}
      >
        {[]}
      </GridList>
    );

    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });
});
