import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchField } from "./SearchField";

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

  it("disables the input when isDisabled", () => {
    render(<SearchField label="Search" isDisabled />);

    expect(screen.getByRole("searchbox")).toBeDisabled();
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
});
