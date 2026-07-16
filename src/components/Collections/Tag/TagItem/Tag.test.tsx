import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagGroup } from "@/components/Collections/Tag/TagGroup/TagGroup";
import { Tag } from "./Tag";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe("Tag", () => {
  it("renders its content", () => {
    render(
      <TagGroup label="Flavors">
        <Tag id="mint">Mint</Tag>
      </TagGroup>
    );

    expect(screen.getByRole("row", { name: "Mint" })).toBeInTheDocument();
  });

  it("renders a remove button when the group is removable", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <TagGroup label="Flavors" onRemove={onRemove}>
        <Tag id="mint">Mint</Tag>
      </TagGroup>
    );

    const tag = screen.getByRole("row", { name: "Mint" });
    await user.click(within(tag).getByRole("button", { name: /Remove/ }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect([...onRemove.mock.calls[0][0]]).toEqual(["mint"]);
  });

  it("does not render a remove button when the group is not removable", () => {
    render(
      <TagGroup label="Flavors">
        <Tag id="mint">Mint</Tag>
      </TagGroup>
    );

    expect(
      screen.queryByRole("button", { name: /Remove/ })
    ).not.toBeInTheDocument();
  });

  it("cannot be selected when its key is disabled", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <TagGroup
        label="Flavors"
        selectionMode="single"
        disabledKeys={["mint"]}
        onSelectionChange={onSelectionChange}
      >
        <Tag id="mint">Mint</Tag>
      </TagGroup>
    );

    await user.click(screen.getByRole("row", { name: "Mint" }));

    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
