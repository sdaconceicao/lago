import { render, screen } from "@testing-library/react";
import { DialogBody } from "./DialogBody";

describe("DialogBody", () => {
  it("renders its children", () => {
    render(<DialogBody>Body content</DialogBody>);

    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("renders a div carrying the dialog-body class", () => {
    render(<DialogBody>Body</DialogBody>);

    const body = screen.getByText("Body");
    expect(body.tagName).toBe("DIV");
    expect(body).toHaveClass("dialog-body");
  });

  it("merges a custom className with dialog-body", () => {
    render(<DialogBody className="custom-body">Body</DialogBody>);

    expect(screen.getByText("Body")).toHaveClass("dialog-body", "custom-body");
  });

  it("forwards arbitrary HTML attributes to the underlying div", () => {
    render(
      <DialogBody id="body-1" data-testid="body" aria-label="Details">
        Body
      </DialogBody>
    );

    const body = screen.getByTestId("body");
    expect(body).toHaveAttribute("id", "body-1");
    expect(body).toHaveAttribute("aria-label", "Details");
  });
});
