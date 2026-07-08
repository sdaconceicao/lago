import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders a checkbox labelled by its children", () => {
    render(<Checkbox>Accept terms</Checkbox>);

    expect(
      screen.getByRole("checkbox", { name: "Accept terms" })
    ).toBeInTheDocument();
  });

  it("toggles when clicked and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>Accept terms</Checkbox>);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true);

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("supports defaultSelected", () => {
    render(<Checkbox defaultSelected>Accept terms</Checkbox>);

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("supports controlled selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Checkbox isSelected onChange={onChange}>
        Accept terms
      </Checkbox>
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();

    await user.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(false);
    expect(checkbox).toBeChecked();
  });

  it("toggles with the keyboard", async () => {
    const user = userEvent.setup();
    render(<Checkbox>Accept terms</Checkbox>);

    await user.tab();
    await user.keyboard(" ");

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("supports the indeterminate state", () => {
    render(<Checkbox isIndeterminate>Select all</Checkbox>);

    expect(screen.getByRole("checkbox")).toBePartiallyChecked();
  });

  it("is disabled when isDisabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Checkbox isDisabled onChange={onChange}>
        Accept terms
      </Checkbox>
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();

    await user.click(checkbox);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders the description", () => {
    render(<Checkbox description="You must accept">Accept terms</Checkbox>);

    expect(screen.getByText("You must accept")).toBeInTheDocument();
  });

  it("shows the error message when invalid", () => {
    render(
      <Checkbox isInvalid errorMessage="This is required">
        Accept terms
      </Checkbox>
    );

    expect(screen.getByText("This is required")).toBeInTheDocument();
  });
});
