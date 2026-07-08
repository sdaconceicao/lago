import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberField } from "./NumberField";

describe("NumberField", () => {
  it("renders an input with an accessible label", () => {
    render(<NumberField label="Cookies" />);

    expect(
      screen.getByRole("textbox", { name: "Cookies" })
    ).toBeInTheDocument();
  });

  it("renders increment and decrement buttons", () => {
    render(<NumberField label="Cookies" />);

    expect(
      screen.getByRole("button", { name: /increase/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /decrease/i })
    ).toBeInTheDocument();
  });

  it("displays the default value", () => {
    render(<NumberField label="Cookies" defaultValue={5} />);

    expect(screen.getByRole("textbox")).toHaveValue("5");
  });

  it("increments the value when the increment button is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <NumberField label="Cookies" defaultValue={5} onChange={onChange} />
    );

    await user.click(screen.getByRole("button", { name: /increase/i }));

    expect(onChange).toHaveBeenCalledWith(6);
    expect(screen.getByRole("textbox")).toHaveValue("6");
  });

  it("decrements the value when the decrement button is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <NumberField label="Cookies" defaultValue={5} onChange={onChange} />
    );

    await user.click(screen.getByRole("button", { name: /decrease/i }));

    expect(onChange).toHaveBeenCalledWith(4);
    expect(screen.getByRole("textbox")).toHaveValue("4");
  });

  it("commits a typed value on blur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberField label="Cookies" onChange={onChange} />);

    await user.type(screen.getByRole("textbox"), "42");
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(42);
  });

  it("disables the increment button at maxValue", () => {
    render(<NumberField label="Cookies" defaultValue={10} maxValue={10} />);

    expect(screen.getByRole("button", { name: /increase/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /decrease/i })
    ).not.toBeDisabled();
  });

  it("disables the input and steppers when isDisabled", () => {
    render(<NumberField label="Cookies" isDisabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: /increase/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /decrease/i })).toBeDisabled();
  });

  it("associates the description with the input", () => {
    render(<NumberField label="Cookies" description="How many you want" />);

    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "How many you want"
    );
  });

  it("shows the error message when invalid", () => {
    render(
      <NumberField label="Cookies" isInvalid errorMessage="Too many cookies" />
    );

    expect(screen.getByText("Too many cookies")).toBeInTheDocument();
  });
});
