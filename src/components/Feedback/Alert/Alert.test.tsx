import { render, screen } from "@testing-library/react";
import { Alert } from "./Alert";
import { AlertBody } from "./BaseComponents/AlertBody";
import { AlertFooter } from "./BaseComponents/AlertFooter";
import { AlertHeader } from "./BaseComponents/AlertHeader";

describe("Alert", () => {
  it("renders its children", () => {
    render(<Alert>Something happened.</Alert>);

    expect(screen.getByText("Something happened.")).toBeInTheDocument();
  });

  it("exposes the header, body and footer as static members", () => {
    expect(Alert.Header).toBe(AlertHeader);
    expect(Alert.Body).toBe(AlertBody);
    expect(Alert.Footer).toBe(AlertFooter);
  });

  it("renders a neutral module announced politely by default", () => {
    render(<Alert>Message</Alert>);

    const alert = screen.getByRole("status");
    expect(alert.tagName).toBe("DIV");
    expect(alert).toHaveClass("alert");
    expect(alert).toHaveAttribute("data-variant", "default");
    expect(alert).toHaveAttribute("data-type", "module");
  });

  it("flags every variant on the root element", () => {
    for (const variant of [
      "default",
      "info",
      "success",
      "warning",
      "error",
    ] as const) {
      const { unmount } = render(<Alert variant={variant}>Message</Alert>);

      expect(screen.getByRole("status")).toHaveAttribute(
        "data-variant",
        variant
      );
      unmount();
    }
  });

  it("flags both types on the root element", () => {
    for (const type of ["module", "fullWidth"] as const) {
      const { unmount } = render(<Alert type={type}>Message</Alert>);

      expect(screen.getByRole("status")).toHaveAttribute("data-type", type);
      unmount();
    }
  });

  it("announces assertively when the role is alert", () => {
    render(<Alert role="alert">Message</Alert>);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("drops its semantics when the role is none", () => {
    render(<Alert role="none">Message</Alert>);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("Message")).toHaveAttribute("role", "none");
  });

  it("passes its variant down to the header's default icon", () => {
    const { container: warning, unmount } = render(
      <Alert variant="warning">
        <Alert.Header title="Heads up" />
      </Alert>
    );
    const warningIcon = warning.querySelector(".alert-icon")?.innerHTML;
    unmount();

    const { container: error } = render(
      <Alert variant="error">
        <Alert.Header title="Heads up" />
      </Alert>
    );
    const errorIcon = error.querySelector(".alert-icon")?.innerHTML;

    expect(warningIcon).toBeTruthy();
    expect(errorIcon).toBeTruthy();
    expect(warningIcon).not.toBe(errorIcon);
  });

  it("composes a header, body and footer", () => {
    render(
      <Alert variant="error">
        <Alert.Header title="Payment failed" subtitle="Card declined" />
        <Alert.Body>Update your card to keep your subscription.</Alert.Body>
        <Alert.Footer>
          <button type="button">Update card</button>
        </Alert.Footer>
      </Alert>
    );

    expect(
      screen.getByRole("heading", { name: "Payment failed" })
    ).toBeInTheDocument();
    expect(screen.getByText("Card declined")).toBeInTheDocument();
    expect(
      screen.getByText("Update your card to keep your subscription.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Update card" })
    ).toBeInTheDocument();
  });

  it("renders without a header", () => {
    render(
      <Alert>
        <Alert.Body>Body only.</Alert.Body>
      </Alert>
    );

    expect(screen.getByText("Body only.")).toBeInTheDocument();
    expect(
      screen.getByRole("status").querySelector(".alert-header")
    ).toBeNull();
  });

  it("merges a custom className with alert", () => {
    render(<Alert className="custom-alert">Message</Alert>);

    expect(screen.getByRole("status")).toHaveClass("alert", "custom-alert");
  });

  it("forwards arbitrary HTML attributes to the root element", () => {
    render(
      <Alert id="alert-1" aria-label="Billing">
        Message
      </Alert>
    );

    const alert = screen.getByRole("status", { name: "Billing" });
    expect(alert).toHaveAttribute("id", "alert-1");
  });
});
