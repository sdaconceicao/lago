import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select, SelectItem } from "./Select";

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

describe("debug empty state", () => {
  it("measures empty state vs single item", async () => {
    const user = userEvent.setup();
    render(
      <Select label="Flavor" placeholder="Select an item">
        <SelectItem id="chocolate">Chocolate</SelectItem>
        <SelectItem id="mint">Mint</SelectItem>
      </Select>
    );

    // Single item position
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    const firstItem = screen.getAllByRole("option")[0];
    const itemRect = firstItem.getBoundingClientRect();
    const listboxRect = listbox.getBoundingClientRect();
    console.log("LISTBOX CLASS:", listbox.className);
    console.log(
      "ITEM left offset from listbox:",
      itemRect.left - listboxRect.left
    );
    console.log("ITEM text content:", firstItem.textContent);
    // close
    await user.keyboard("{Escape}");

    // Empty state position
    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox"), "zzz");
    const empty = await screen.findByText("No results found.");
    const emptyListbox = empty.closest("[role='listbox']")!;
    const emptyRect = empty.getBoundingClientRect();
    const emptyLbRect = emptyListbox.getBoundingClientRect();
    console.log("EMPTY LISTBOX CLASS:", emptyListbox.className);
    console.log(
      "EMPTY left offset from listbox:",
      emptyRect.left - emptyLbRect.left
    );
    console.log("EMPTY data-empty:", emptyListbox.getAttribute("data-empty"));
  });
});
