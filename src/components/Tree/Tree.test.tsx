import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tree, TreeItem } from "./Tree";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const renderTree = (props = {}) =>
  render(
    <Tree aria-label="Files" {...props}>
      <TreeItem id="documents" title="Documents">
        <TreeItem id="project" title="Project">
          <TreeItem id="report" title="Weekly Report" />
        </TreeItem>
      </TreeItem>
      <TreeItem id="photos" title="Photos">
        <TreeItem id="image-1" title="Image 1" />
      </TreeItem>
    </Tree>
  );

describe("Tree", () => {
  it("renders a tree with only top-level items when collapsed", () => {
    renderTree();

    expect(screen.getByRole("treegrid", { name: "Files" })).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows.map((r) => r.textContent)).toEqual(["Documents", "Photos"]);
    expect(rows[0]).toHaveAttribute("aria-expanded", "false");
  });

  it("renders nested items for defaultExpandedKeys", () => {
    renderTree({ defaultExpandedKeys: ["documents", "project"] });

    expect(screen.getByRole("row", { name: "Documents" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(
      screen.getByRole("row", { name: "Weekly Report" })
    ).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "Project" })).toHaveAttribute(
      "aria-level",
      "2"
    );
    expect(screen.getByRole("row", { name: "Weekly Report" })).toHaveAttribute(
      "aria-level",
      "3"
    );
  });

  it("expands and collapses via the chevron button and calls onExpandedChange", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    renderTree({ onExpandedChange });

    const documents = screen.getByRole("row", { name: "Documents" });
    await user.click(within(documents).getByRole("button"));

    expect(documents).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("row", { name: "Project" })).toBeInTheDocument();
    expect([...onExpandedChange.mock.calls[0][0]]).toEqual(["documents"]);

    await user.click(within(documents).getByRole("button"));
    expect(documents).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("row", { name: "Project" })
    ).not.toBeInTheDocument();
  });

  it("expands an item with the keyboard", async () => {
    const user = userEvent.setup();
    renderTree();

    await user.tab();
    expect(screen.getByRole("row", { name: "Documents" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("row", { name: "Documents" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByRole("row", { name: "Project" })).toBeInTheDocument();
  });

  it("supports multiple selection with checkboxes", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderTree({ selectionMode: "multiple", onSelectionChange });

    const documents = screen.getByRole("row", { name: "Documents" });
    const photos = screen.getByRole("row", { name: "Photos" });

    await user.click(within(documents).getByRole("checkbox"));
    await user.click(within(photos).getByRole("checkbox"));

    expect(documents).toHaveAttribute("aria-selected", "true");
    expect(photos).toHaveAttribute("aria-selected", "true");
    expect([...onSelectionChange.mock.calls[1][0]]).toEqual([
      "documents",
      "photos",
    ]);
  });

  it("marks disabled items and prevents selecting them", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderTree({
      selectionMode: "multiple",
      disabledKeys: ["photos"],
      onSelectionChange,
    });

    const photos = screen.getByRole("row", { name: "Photos" });
    expect(photos).toHaveAttribute("aria-disabled", "true");

    await user.click(photos);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("calls onAction when an item is actioned", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderTree({ onAction });

    await user.click(screen.getByRole("row", { name: "Photos" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("photos");
  });
});
