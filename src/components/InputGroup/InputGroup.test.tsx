import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "react-aria-components/Input";
import { InputGroup } from "./InputGroup";

describe("InputGroup", () => {
  it("renders a group labelled by the label", () => {
    render(
      <InputGroup label="Amount">
        <Input aria-label="Value" />
      </InputGroup>
    );

    expect(screen.getByRole("group", { name: "Amount" })).toBeInTheDocument();
  });

  it("renders its children inside the group", () => {
    render(
      <InputGroup label="Amount">
        <Input aria-label="Value" />
      </InputGroup>
    );

    expect(screen.getByRole("group")).toContainElement(
      screen.getByRole("textbox", { name: "Value" })
    );
  });

  it("renders the label as a span, not a label element", () => {
    render(
      <InputGroup label="Amount">
        <Input aria-label="Value" />
      </InputGroup>
    );

    const label = screen.getByText("Amount");
    expect(label.tagName).toBe("SPAN");
  });

  it("renders no label element when label is omitted", () => {
    const { container } = render(
      <InputGroup aria-label="Amount">
        <Input aria-label="Value" />
      </InputGroup>
    );

    expect(container.querySelector(".react-aria-Label")).toBeNull();
  });

  it("supports typing in a child input", async () => {
    const user = userEvent.setup();
    render(
      <InputGroup label="Amount">
        <Input aria-label="Value" />
      </InputGroup>
    );

    await user.type(screen.getByRole("textbox"), "100");

    expect(screen.getByRole("textbox")).toHaveValue("100");
  });

  it("disables child inputs when isDisabled", () => {
    render(
      <InputGroup label="Amount" isDisabled>
        <Input aria-label="Value" />
      </InputGroup>
    );

    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
