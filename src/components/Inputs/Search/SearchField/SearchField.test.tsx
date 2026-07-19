import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchField } from "./SearchField";
import { DEFAULT_DEBOUNCE_DELAY } from "./SearchField.utils";

describe("SearchField", () => {
  it("renders a searchbox with an accessible label", () => {
    render(<SearchField label="Search" />);

    expect(
      screen.getByRole("searchbox", { name: "Search" })
    ).toBeInTheDocument();
  });

  it("renders the placeholder", () => {
    render(<SearchField label="Search" placeholder="Search products" />);

    expect(screen.getByPlaceholderText("Search products")).toBeInTheDocument();
  });

  it("calls onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchField label="Search" onChange={onChange} />);

    await user.type(screen.getByRole("searchbox"), "abc");

    expect(onChange).toHaveBeenLastCalledWith("abc");
  });

  it("clears the input when the clear button is pressed", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<SearchField label="Search" defaultValue="abc" onClear={onClear} />);

    await user.click(screen.getByRole("button", { name: /clear/i }));

    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("clears the input when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<SearchField label="Search" defaultValue="abc" onClear={onClear} />);

    await user.click(screen.getByRole("searchbox"));
    await user.keyboard("{Escape}");

    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("submits the current value when Enter is pressed", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SearchField label="Search" onSubmit={onSubmit} />);

    await user.type(screen.getByRole("searchbox"), "widgets{Enter}");

    expect(onSubmit).toHaveBeenCalledWith("widgets");
  });

  it("submits the current value when the search button is pressed", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SearchField label="Search" onSubmit={onSubmit} />);

    await user.type(screen.getByRole("searchbox"), "widgets");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(onSubmit).toHaveBeenCalledWith("widgets");
  });

  it("disables the input and the search button when isDisabled", () => {
    render(<SearchField label="Search" isDisabled />);

    expect(screen.getByRole("searchbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Search" })).toBeDisabled();
  });

  it("associates the description with the input", () => {
    render(<SearchField label="Search" description="Search all products" />);

    expect(screen.getByRole("searchbox")).toHaveAccessibleDescription(
      "Search all products"
    );
  });

  it("shows the error message when invalid", () => {
    render(<SearchField label="Search" isInvalid errorMessage="Bad query" />);

    expect(screen.getByText("Bad query")).toBeInTheDocument();
  });

  describe("debounced search", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("fires onSearch once with the final value after the default delay", () => {
      const onSearch = vi.fn();
      render(<SearchField label="Search" onSearch={onSearch} />);
      const input = screen.getByRole("searchbox");

      fireEvent.change(input, { target: { value: "a" } });
      fireEvent.change(input, { target: { value: "ab" } });
      fireEvent.change(input, { target: { value: "abc" } });
      expect(onSearch).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(DEFAULT_DEBOUNCE_DELAY);
      });

      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith("abc");
    });

    it("waits for a custom debounceDelay before firing onSearch", () => {
      const onSearch = vi.fn();
      render(
        <SearchField label="Search" onSearch={onSearch} debounceDelay={500} />
      );

      fireEvent.change(screen.getByRole("searchbox"), {
        target: { value: "abc" },
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(onSearch).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith("abc");
    });
  });
});
