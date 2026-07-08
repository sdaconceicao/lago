import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tag, TagGroup } from "./TagGroup";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const renderTagGroup = (props = {}) =>
  render(
    <TagGroup label="Ice cream flavor" {...props}>
      <Tag id="chocolate">Chocolate</Tag>
      <Tag id="mint">Mint</Tag>
      <Tag id="strawberry">Strawberry</Tag>
    </TagGroup>
  );

describe("TagGroup", () => {
  it("renders a labeled grid of tags", () => {
    renderTagGroup();

    const grid = screen.getByRole("grid", { name: "Ice cream flavor" });
    const tags = within(grid).getAllByRole("row");
    expect(tags).toHaveLength(3);
    expect(tags.map((t) => t.textContent)).toEqual([
      "Chocolate",
      "Mint",
      "Strawberry",
    ]);
  });

  it("supports single selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderTagGroup({ selectionMode: "single", onSelectionChange });

    await user.click(screen.getByRole("row", { name: "Mint" }));

    expect(screen.getByRole("row", { name: "Mint" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect([...onSelectionChange.mock.calls[0][0]]).toEqual(["mint"]);
  });

  it("supports multiple selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderTagGroup({ selectionMode: "multiple", onSelectionChange });

    await user.click(screen.getByRole("row", { name: "Chocolate" }));
    await user.click(screen.getByRole("row", { name: "Strawberry" }));

    expect([...onSelectionChange.mock.calls[1][0]]).toEqual([
      "chocolate",
      "strawberry",
    ]);
  });

  it("renders remove buttons and calls onRemove with the tag key", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    renderTagGroup({ onRemove });

    // The remove button is labelled by its own "Remove" label plus the tag.
    const mintTag = screen.getByRole("row", { name: "Mint" });
    await user.click(within(mintTag).getByRole("button", { name: /Remove/ }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect([...onRemove.mock.calls[0][0]]).toEqual(["mint"]);
  });

  it("does not render remove buttons without onRemove", () => {
    renderTagGroup();

    expect(
      screen.queryByRole("button", { name: /Remove/ })
    ).not.toBeInTheDocument();
  });

  it("marks disabled tags and prevents selecting them", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    renderTagGroup({
      selectionMode: "single",
      disabledKeys: ["strawberry"],
      onSelectionChange,
    });

    const strawberry = screen.getByRole("row", { name: "Strawberry" });
    await user.click(strawberry);

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("renders the empty state when there are no tags", () => {
    render(
      <TagGroup label="Flavors" renderEmptyState={() => "No flavors."}>
        {[]}
      </TagGroup>
    );

    expect(screen.getByText("No flavors.")).toBeInTheDocument();
  });

  it("renders description and error message", () => {
    renderTagGroup({
      description: "Your favorite flavors",
      errorMessage: "Something went wrong",
    });

    expect(screen.getByText("Your favorite flavors")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
