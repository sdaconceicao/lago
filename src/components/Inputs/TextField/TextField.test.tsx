import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FieldButton } from "@/components/Inputs/FormComponents/index";
import { TextField } from "./TextField";

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

  describe("with a trailing button", () => {
    it("renders the button alongside the input", () => {
      render(
        <TextField
          label="Search"
          button={<FieldButton aria-label="Clear">x</FieldButton>}
        />
      );

      expect(
        screen.getByRole("textbox", { name: "Search" })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    });

    it("presses the trailing button", async () => {
      const user = userEvent.setup();
      const onPress = vi.fn();
      render(
        <TextField
          label="Search"
          button={
            <FieldButton aria-label="Clear" onPress={onPress}>
              x
            </FieldButton>
          }
        />
      );

      await user.click(screen.getByRole("button", { name: "Clear" }));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("still forwards inputRef to the input element", () => {
      const ref = { current: null as HTMLInputElement | null };
      render(
        <TextField
          label="Search"
          inputRef={ref}
          button={<FieldButton aria-label="Clear">x</FieldButton>}
        />
      );

      expect(ref.current).toBe(screen.getByRole("textbox"));
    });
  });
});
