import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Password } from "./Password";

// A masked input exposes no role, so the label is the handle for every query.
const getInput = () => screen.getByLabelText("Password");

describe("Password", () => {
  it("renders a masked input with an accessible label", () => {
    render(<Password label="Password" />);

    expect(getInput()).toBeInTheDocument();
    expect(getInput()).toHaveAttribute("type", "password");
  });

  it("renders the placeholder", () => {
    render(<Password label="Password" placeholder="Enter your password" />);

    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();
  });

  it("supports an uncontrolled default value", () => {
    render(<Password label="Password" defaultValue="hunter2" />);

    expect(getInput()).toHaveValue("hunter2");
  });

  it("calls onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Password label="Password" onChange={onChange} />);

    await user.type(getInput(), "abc");

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith("abc");
  });

  it("associates the description with the input", () => {
    render(<Password label="Password" description="At least 12 characters" />);

    expect(getInput()).toHaveAccessibleDescription("At least 12 characters");
  });

  it("shows the error message when invalid", () => {
    render(
      <Password label="Password" isInvalid errorMessage="Password too short" />
    );

    expect(getInput()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Password too short")).toBeInTheDocument();
  });

  it("does not render the error message when valid", () => {
    render(<Password label="Password" errorMessage="Password too short" />);

    expect(screen.queryByText("Password too short")).not.toBeInTheDocument();
  });

  it("forwards autoComplete to the input", () => {
    render(<Password label="Password" autoComplete="new-password" />);

    expect(getInput()).toHaveAttribute("autocomplete", "new-password");
  });

  it("forwards inputRef to the input element", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Password label="Password" inputRef={ref} />);

    expect(ref.current).toBe(getInput());
  });

  describe("reveal toggle", () => {
    it("unmasks the value when pressed", async () => {
      const user = userEvent.setup();
      render(<Password label="Password" defaultValue="hunter2" />);

      await user.click(screen.getByRole("button", { name: "Show password" }));

      expect(getInput()).toHaveAttribute("type", "text");
      expect(getInput()).toHaveValue("hunter2");
    });

    it("masks the value again when pressed a second time", async () => {
      const user = userEvent.setup();
      render(<Password label="Password" defaultValue="hunter2" />);

      await user.click(screen.getByRole("button", { name: "Show password" }));
      await user.click(screen.getByRole("button", { name: "Hide password" }));

      expect(getInput()).toHaveAttribute("type", "password");
    });

    it("does not render the toggle when isRevealable is false", () => {
      render(<Password label="Password" isRevealable={false} />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(getInput()).toHaveAttribute("type", "password");
    });
  });

  describe("isDisabled", () => {
    it("disables the input", () => {
      render(<Password label="Password" isDisabled />);

      expect(getInput()).toBeDisabled();
    });

    it("disables the reveal toggle", () => {
      render(<Password label="Password" isDisabled />);

      expect(
        screen.getByRole("button", { name: "Show password" })
      ).toBeDisabled();
    });
  });

  describe("size", () => {
    it('renders data-field-size="md" by default', () => {
      const { container } = render(<Password label="Password" />);

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "md"
      );
    });

    it('renders data-field-size="sm" when specified', () => {
      const { container } = render(<Password label="Password" size="sm" />);

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "sm"
      );
    });

    it('renders data-field-size="lg" when specified', () => {
      const { container } = render(<Password label="Password" size="lg" />);

      expect(container.querySelector("[data-field-size]")).toHaveAttribute(
        "data-field-size",
        "lg"
      );
    });

    it("does not forward size to the DOM input", () => {
      render(<Password label="Password" size="sm" />);

      expect(getInput()).not.toHaveAttribute("size");
    });
  });
});
