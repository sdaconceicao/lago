import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { TextField } from "@/components/Inputs/TextField/TextField";
import { Description, FieldButton, Form, Label } from "../index";

describe("Form", () => {
  it("renders children inside a form element", () => {
    render(
      <Form aria-label="Sign up">
        <span>content</span>
      </Form>
    );

    const form = screen.getByRole("form", { name: "Sign up" });
    expect(form).toBeInTheDocument();
    expect(form).toContainElement(screen.getByText("content"));
  });

  it("calls onSubmit when the form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <Form aria-label="Sign up" onSubmit={onSubmit}>
        <FieldButton type="submit">Submit</FieldButton>
      </Form>
    );

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("blocks submission when a required field is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <Form aria-label="Sign up" onSubmit={onSubmit}>
        <TextField name="email" label="Email" isRequired />
        <FieldButton type="submit">Submit</FieldButton>
      </Form>
    );

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox")).toBeInvalid();
  });

  it("clears validation errors once the field is corrected", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <Form aria-label="Sign up" onSubmit={onSubmit}>
        <TextField name="username" label="Username" isRequired />
        <FieldButton type="submit">Submit</FieldButton>
      </Form>
    );

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByRole("textbox")).toBeInvalid();

    await user.type(screen.getByRole("textbox"), "ada");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe("Label", () => {
  it("renders a label element with its content", () => {
    render(<Label>Email</Label>);

    const label = screen.getByText("Email");
    expect(label.tagName).toBe("LABEL");
  });

  it("is not marked required by default", () => {
    render(<Label>Email</Label>);

    expect(screen.getByText("Email")).not.toHaveAttribute("data-required");
  });

  it("marks the label as required when isRequired is set", () => {
    render(<Label isRequired>Email</Label>);

    expect(screen.getByText("Email")).toHaveAttribute("data-required");
  });

  it("forwards isRequired from a field component to its label", () => {
    render(<TextField label="Email" isRequired />);

    expect(screen.getByText("Email")).toHaveAttribute("data-required");
  });
});

describe("Description", () => {
  it("renders text with the field-description class", () => {
    render(<Description>Helpful hint</Description>);

    const description = screen.getByText("Helpful hint");
    expect(description).toHaveClass("field-description");
  });
});

describe("FieldButton", () => {
  it("renders a button with the field-Button class", () => {
    render(<FieldButton>Press me</FieldButton>);

    const button = screen.getByRole("button", { name: "Press me" });
    expect(button).toHaveClass("field-Button");
  });

  it("calls onPress when clicked", async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(<FieldButton onPress={onPress}>Press me</FieldButton>);

    await user.click(screen.getByRole("button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
