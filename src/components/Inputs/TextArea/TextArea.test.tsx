import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextArea } from "./TextArea";

describe("TextArea", () => {
  it("renders a textarea with an accessible label", () => {
    render(<TextArea label="Bio" />);

    const textarea = screen.getByRole("textbox", { name: "Bio" });
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("renders the placeholder", () => {
    render(<TextArea label="Bio" placeholder="Tell us about yourself" />);

    expect(
      screen.getByPlaceholderText("Tell us about yourself")
    ).toBeInTheDocument();
  });

  it("supports an uncontrolled default value", () => {
    render(<TextArea label="Bio" defaultValue="Hello" />);

    expect(screen.getByRole("textbox")).toHaveValue("Hello");
  });

  it("calls onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextArea label="Bio" onChange={onChange} />);

    await user.type(screen.getByRole("textbox"), "hi");

    expect(onChange).toHaveBeenLastCalledWith("hi");
  });

  it("associates the description with the textarea", () => {
    render(<TextArea label="Bio" description="Max 500 characters" />);

    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "Max 500 characters"
    );
  });

  it("shows the error message when invalid", () => {
    render(<TextArea label="Bio" isInvalid errorMessage="Too long" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Too long")).toBeInTheDocument();
  });

  it("does not render the error message when valid", () => {
    render(<TextArea label="Bio" errorMessage="Too long" />);

    expect(screen.queryByText("Too long")).not.toBeInTheDocument();
  });

  it("disables the textarea when isDisabled", () => {
    render(<TextArea label="Bio" isDisabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("forwards inputRef to the textarea element", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<TextArea label="Bio" inputRef={ref} />);

    expect(ref.current).toBe(screen.getByRole("textbox"));
  });
});
