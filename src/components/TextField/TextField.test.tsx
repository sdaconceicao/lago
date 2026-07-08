import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextArea, TextField } from "./TextField";

describe("TextField", () => {
  it("renders an input with an accessible label", () => {
    render(<TextField label="Email" />);

    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
  });

  it("renders the placeholder", () => {
    render(<TextField label="Email" placeholder="Enter your email" />);

    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });

  it("supports an uncontrolled default value", () => {
    render(<TextField label="Name" defaultValue="Ada" />);

    expect(screen.getByRole("textbox")).toHaveValue("Ada");
  });

  it("calls onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextField label="Name" onChange={onChange} />);

    await user.type(screen.getByRole("textbox"), "abc");

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith("abc");
  });

  it("associates the description with the input", () => {
    render(<TextField label="Email" description="We never share it" />);

    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "We never share it"
    );
  });

  it("shows the error message when invalid", () => {
    render(<TextField label="Email" isInvalid errorMessage="Invalid email" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("does not render the error message when valid", () => {
    render(<TextField label="Email" errorMessage="Invalid email" />);

    expect(screen.queryByText("Invalid email")).not.toBeInTheDocument();
  });

  it("disables the input when isDisabled", () => {
    render(<TextField label="Email" isDisabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("forwards inputRef to the input element", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<TextField label="Email" inputRef={ref} />);

    expect(ref.current).toBe(screen.getByRole("textbox"));
  });
});

describe("TextArea", () => {
  it("renders a textarea with an accessible label", () => {
    render(<TextArea label="Bio" />);

    const textarea = screen.getByRole("textbox", { name: "Bio" });
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("calls onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextArea label="Bio" onChange={onChange} />);

    await user.type(screen.getByRole("textbox"), "hi");

    expect(onChange).toHaveBeenLastCalledWith("hi");
  });

  it("shows the error message when invalid", () => {
    render(<TextArea label="Bio" isInvalid errorMessage="Too long" />);

    expect(screen.getByText("Too long")).toBeInTheDocument();
  });
});
