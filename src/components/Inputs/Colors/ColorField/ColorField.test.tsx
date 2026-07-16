import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { parseColor } from "react-aria-components";
import { ColorField } from "./ColorField";

describe("ColorField", () => {
  it("renders a labeled text input", () => {
    render(<ColorField label="Color" />);

    expect(screen.getByRole("textbox", { name: "Color" })).toBeInTheDocument();
  });

  it("shows the formatted default value", () => {
    render(<ColorField label="Color" defaultValue="#ff0000" />);

    expect(screen.getByRole("textbox")).toHaveValue("#FF0000");
  });

  it("renders a placeholder", () => {
    render(<ColorField label="Color" placeholder="#000000" />);

    expect(screen.getByPlaceholderText("#000000")).toBeInTheDocument();
  });

  it("renders a description linked to the input", () => {
    render(<ColorField label="Color" description="Enter a hex color" />);

    const description = screen.getByText("Enter a hex color");
    const input = screen.getByRole("textbox");

    expect(input).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining(description.id)
    );
  });

  it("commits a typed value on blur and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorField label="Color" defaultValue="#ff0000" onChange={onChange} />
    );

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "00ff00");
    await user.tab();

    expect(onChange).toHaveBeenCalled();
    const color = onChange.mock.calls.at(-1)?.[0];
    expect(color.toString("hex")).toBe("#00FF00");
    expect(input).toHaveValue("#00FF00");
  });

  it("reverts invalid input on blur without calling onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorField
        label="Color"
        defaultValue={parseColor("#ff0000")}
        onChange={onChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "not-a-color");
    await user.tab();

    expect(input).toHaveValue("#FF0000");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows an error message when invalid", () => {
    render(<ColorField label="Color" isInvalid errorMessage="Bad color" />);

    expect(screen.getByText("Bad color")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });
});
