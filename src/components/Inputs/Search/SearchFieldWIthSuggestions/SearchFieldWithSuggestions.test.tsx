import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SearchSuggestion } from "../SearchField/SearchField.utils";
import { SearchFieldWithSuggestions } from "./SearchFieldWithSuggestions";

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

const fruits: SearchSuggestion[] = [
  { id: "apple", label: "Apple" },
  { id: "apricot", label: "Apricot" },
  { id: "banana", label: "Banana" },
];

describe("SearchFieldWithSuggestions", () => {
  describe("with static suggestions", () => {
    it("renders a labeled searchbox", () => {
      render(
        <SearchFieldWithSuggestions label="Search" suggestions={fruits} />
      );

      expect(
        screen.getByRole("searchbox", { name: "Search" })
      ).toBeInTheDocument();
    });

    it("renders the defaultValue", () => {
      render(
        <SearchFieldWithSuggestions
          label="Search"
          suggestions={fruits}
          defaultValue="ap"
        />
      );

      expect(screen.getByRole("searchbox")).toHaveValue("ap");
    });

    it("shows suggestions matching the query while typing", async () => {
      const user = userEvent.setup();
      render(
        <SearchFieldWithSuggestions label="Search" suggestions={fruits} />
      );

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

      await user.type(screen.getByRole("searchbox"), "ap");

      const options = await screen.findAllByRole("option");
      expect(options.map((o) => o.textContent)).toEqual(["Apple", "Apricot"]);
    });

    it("shows an empty state when no suggestions match", async () => {
      const user = userEvent.setup();
      render(
        <SearchFieldWithSuggestions label="Search" suggestions={fruits} />
      );

      await user.type(screen.getByRole("searchbox"), "zzz");

      expect(await screen.findByText("No results found.")).toBeInTheDocument();
    });

    it("fills the field and reports the pick when a suggestion is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onSuggestionSelect = vi.fn();
      render(
        <SearchFieldWithSuggestions
          label="Search"
          suggestions={fruits}
          onChange={onChange}
          onSuggestionSelect={onSuggestionSelect}
        />
      );

      await user.type(screen.getByRole("searchbox"), "ban");
      await user.click(await screen.findByRole("option", { name: "Banana" }));

      expect(screen.getByRole("searchbox")).toHaveValue("Banana");
      expect(onSuggestionSelect).toHaveBeenCalledTimes(1);
      expect(onSuggestionSelect).toHaveBeenCalledWith({
        id: "banana",
        label: "Banana",
      });
      expect(onChange).toHaveBeenLastCalledWith("Banana");
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("selects the highlighted suggestion with the keyboard without submitting", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const onSuggestionSelect = vi.fn();
      render(
        <SearchFieldWithSuggestions
          label="Search"
          suggestions={fruits}
          onSubmit={onSubmit}
          onSuggestionSelect={onSuggestionSelect}
        />
      );

      await user.type(screen.getByRole("searchbox"), "ap");
      await screen.findByRole("listbox");
      await user.keyboard("{ArrowDown}{Enter}");

      expect(onSuggestionSelect).toHaveBeenCalledWith({
        id: "apple",
        label: "Apple",
      });
      expect(screen.getByRole("searchbox")).toHaveValue("Apple");
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("allows picking the same suggestion twice in a row", async () => {
      const user = userEvent.setup();
      const onSuggestionSelect = vi.fn();
      render(
        <SearchFieldWithSuggestions
          label="Search"
          suggestions={fruits}
          onSuggestionSelect={onSuggestionSelect}
        />
      );
      const input = screen.getByRole("searchbox");

      await user.type(input, "ban");
      await user.click(await screen.findByRole("option", { name: "Banana" }));
      await user.clear(input);
      await user.type(input, "ban");
      await user.click(await screen.findByRole("option", { name: "Banana" }));

      expect(onSuggestionSelect).toHaveBeenCalledTimes(2);
    });

    it("submits with Enter when no suggestion is highlighted", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <SearchFieldWithSuggestions
          label="Search"
          suggestions={fruits}
          onSubmit={onSubmit}
        />
      );

      await user.type(screen.getByRole("searchbox"), "ban{Enter}");

      expect(onSubmit).toHaveBeenCalledWith("ban");
    });

    it("submits the current value when the search button is pressed", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <SearchFieldWithSuggestions
          label="Search"
          suggestions={fruits}
          onSubmit={onSubmit}
        />
      );

      await user.type(screen.getByRole("searchbox"), "ban");
      await user.click(screen.getByRole("button", { name: "Search" }));

      expect(onSubmit).toHaveBeenCalledWith("ban");
    });

    it("shows the clear button only while the field has a value, and clears on press", async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      render(
        <SearchFieldWithSuggestions
          label="Search"
          suggestions={fruits}
          onClear={onClear}
        />
      );

      expect(
        screen.queryByRole("button", { name: /clear/i })
      ).not.toBeInTheDocument();

      await user.type(screen.getByRole("searchbox"), "ban");
      await user.click(screen.getByRole("button", { name: /clear/i }));

      expect(screen.getByRole("searchbox")).toHaveValue("");
      expect(onClear).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByRole("button", { name: /clear/i })
      ).not.toBeInTheDocument();
    });

    it("closes the dropdown on the first Escape and clears the field on the second", async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      render(
        <SearchFieldWithSuggestions
          label="Search"
          suggestions={fruits}
          onClear={onClear}
        />
      );
      const input = screen.getByRole("searchbox");

      await user.type(input, "ap");
      await screen.findByRole("listbox");

      await user.keyboard("{Escape}");
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
      expect(input).toHaveValue("ap");

      await user.keyboard("{Escape}");
      expect(input).toHaveValue("");
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("disables the input and the search button when isDisabled", () => {
      render(
        <SearchFieldWithSuggestions
          label="Search"
          suggestions={fruits}
          isDisabled
        />
      );

      expect(screen.getByRole("searchbox")).toBeDisabled();
      expect(screen.getByRole("button", { name: "Search" })).toBeDisabled();
    });

    it("associates the description with the input", () => {
      render(
        <SearchFieldWithSuggestions
          label="Search"
          suggestions={fruits}
          description="Search all fruit"
        />
      );

      expect(screen.getByRole("searchbox")).toHaveAccessibleDescription(
        "Search all fruit"
      );
    });

    it("shows the error message when invalid", () => {
      render(
        <SearchFieldWithSuggestions
          label="Search"
          suggestions={fruits}
          isInvalid
          errorMessage="Bad query"
        />
      );

      expect(screen.getByText("Bad query")).toBeInTheDocument();
    });
  });

  describe("with promise-based suggestions", () => {
    it("loads suggestions for the query and shows them in the dropdown", async () => {
      const user = userEvent.setup();
      const loadSuggestions = vi
        .fn<(query: string) => Promise<SearchSuggestion[]>>()
        .mockResolvedValue([{ id: "one", label: "Result one" }]);
      render(
        <SearchFieldWithSuggestions
          label="Search"
          debounceDelay={0}
          loadSuggestions={loadSuggestions}
        />
      );

      await user.type(screen.getByRole("searchbox"), "res");

      expect(
        await screen.findByRole("option", { name: "Result one" })
      ).toBeInTheDocument();
      expect(loadSuggestions).toHaveBeenLastCalledWith("res");
    });

    it("shows a loading state while suggestions load", async () => {
      const user = userEvent.setup();
      let resolveLoad!: (results: SearchSuggestion[]) => void;
      const loadSuggestions = vi.fn(
        () =>
          new Promise<SearchSuggestion[]>((resolve) => {
            resolveLoad = resolve;
          })
      );
      render(
        <SearchFieldWithSuggestions
          label="Search"
          debounceDelay={0}
          loadSuggestions={loadSuggestions}
        />
      );

      await user.type(screen.getByRole("searchbox"), "res");

      expect(await screen.findByText("Searching…")).toBeInTheDocument();

      await act(async () => {
        resolveLoad([{ id: "one", label: "Result one" }]);
      });

      expect(
        await screen.findByRole("option", { name: "Result one" })
      ).toBeInTheDocument();
      expect(screen.queryByText("Searching…")).not.toBeInTheDocument();
    });

    it("ignores stale responses that resolve after a newer query", async () => {
      const user = userEvent.setup();
      const pending: {
        query: string;
        resolve: (results: SearchSuggestion[]) => void;
      }[] = [];
      const loadSuggestions = vi.fn(
        (query: string) =>
          new Promise<SearchSuggestion[]>((resolve) => {
            pending.push({ query, resolve });
          })
      );
      render(
        <SearchFieldWithSuggestions
          label="Search"
          debounceDelay={0}
          loadSuggestions={loadSuggestions}
        />
      );
      const input = screen.getByRole("searchbox");

      await user.type(input, "a");
      await waitFor(() => expect(loadSuggestions).toHaveBeenCalledWith("a"));
      await user.type(input, "b");
      await waitFor(() => expect(loadSuggestions).toHaveBeenCalledWith("ab"));

      // The newer query resolves first; the older one arrives late and stale.
      await act(async () => {
        pending
          .find((p) => p.query === "ab")
          ?.resolve([{ id: "ab", label: "AB result" }]);
      });
      await act(async () => {
        pending
          .find((p) => p.query === "a")
          ?.resolve([{ id: "a", label: "A result" }]);
      });

      expect(
        screen.getByRole("option", { name: "AB result" })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("option", { name: "A result" })
      ).not.toBeInTheDocument();
    });

    it("clears loaded suggestions when the query is cleared", async () => {
      const user = userEvent.setup();
      const loadSuggestions = vi
        .fn<(query: string) => Promise<SearchSuggestion[]>>()
        .mockResolvedValue([{ id: "one", label: "Result one" }]);
      render(
        <SearchFieldWithSuggestions
          label="Search"
          debounceDelay={0}
          loadSuggestions={loadSuggestions}
        />
      );
      const input = screen.getByRole("searchbox");

      await user.type(input, "res");
      await screen.findByRole("option", { name: "Result one" });

      await user.click(screen.getByRole("button", { name: /clear/i }));

      expect(input).toHaveValue("");
      expect(
        screen.queryByRole("option", { name: "Result one" })
      ).not.toBeInTheDocument();
    });
  });
});
