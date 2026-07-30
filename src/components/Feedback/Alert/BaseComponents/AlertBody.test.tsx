import { render, screen } from "@testing-library/react";
import { AlertBody } from "./AlertBody";

describe("AlertBody", () => {
  it("renders its children", () => {
    render(<AlertBody>Your card was declined.</AlertBody>);

    expect(screen.getByText("Your card was declined.")).toBeInTheDocument();
  });

  it("renders a div carrying the alert-body class", () => {
    render(<AlertBody>Body</AlertBody>);

    const body = screen.getByText("Body");
    expect(body.tagName).toBe("DIV");
    expect(body).toHaveClass("alert-body");
  });

  it("merges a custom className with alert-body", () => {
    render(<AlertBody className="custom-body">Body</AlertBody>);

    expect(screen.getByText("Body")).toHaveClass("alert-body", "custom-body");
  });

  it("forwards arbitrary HTML attributes to the body element", () => {
    render(<AlertBody id="body-1">Body</AlertBody>);

    expect(screen.getByText("Body")).toHaveAttribute("id", "body-1");
  });

  it("renders an empty body without children", () => {
    const { container } = render(<AlertBody />);

    expect(container.querySelector(".alert-body")).toBeEmptyDOMElement();
  });
});
