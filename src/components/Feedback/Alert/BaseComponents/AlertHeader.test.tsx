import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertVariantContext } from "../Alert.context";
import { AlertHeader } from "./AlertHeader";

describe("AlertHeader", () => {
  it("renders the title as a level 3 heading by default", () => {
    render(<AlertHeader title="Payment failed" />);

    const heading = screen.getByRole("heading", { name: "Payment failed" });
    expect(heading.tagName).toBe("H3");
  });

  it("renders the title at a custom heading level", () => {
    render(<AlertHeader title="Payment failed" titleLevel={2} />);

    expect(
      screen.getByRole("heading", { name: "Payment failed", level: 2 })
    ).toBeInTheDocument();
  });

  it("renders the subtitle with the alert-subtitle class", () => {
    render(<AlertHeader title="Payment failed" subtitle="Card declined" />);

    const subtitle = screen.getByText("Card declined");
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass("alert-subtitle");
  });

  // `title` is required, but ReactNode admits null, so a caller rendering a
  // title conditionally can still land on these branches.
  it("renders a subtitle and no heading when the title is empty", () => {
    render(<AlertHeader title={null} subtitle="Standalone subtitle" />);

    expect(screen.getByText("Standalone subtitle")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("omits the text wrapper when both the title and subtitle are empty", () => {
    const { container } = render(<AlertHeader title={null} />);

    expect(container.querySelector(".alert-header-text")).toBeNull();
  });

  it("renders a default icon and flags the header when standing alone", () => {
    const { container } = render(<AlertHeader title="Payment failed" />);

    expect(container.querySelector(".alert-icon svg")).toBeInTheDocument();
    expect(container.querySelector(".alert-header")).toHaveAttribute(
      "data-has-icon",
      "true"
    );
  });

  it("renders a different default icon for each variant", () => {
    const icons = (
      ["default", "info", "success", "warning", "error"] as const
    ).map((variant) => {
      const { container, unmount } = render(
        <AlertVariantContext.Provider value={variant}>
          <AlertHeader title="Title" />
        </AlertVariantContext.Provider>
      );
      const markup = container.querySelector(".alert-icon")?.innerHTML ?? "";
      unmount();
      return markup;
    });

    expect(icons.every(Boolean)).toBe(true);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it("renders a custom icon in place of the variant default", () => {
    render(<AlertHeader title="Payment failed" icon={<span>Custom</span>} />);

    expect(screen.getByText("Custom").parentElement).toHaveClass("alert-icon");
  });

  it("drops the icon and the header flag when hideIcon is set", () => {
    const { container } = render(
      <AlertHeader title="Payment failed" hideIcon />
    );

    expect(container.querySelector(".alert-icon")).toBeNull();
    expect(container.querySelector(".alert-header")).not.toHaveAttribute(
      "data-has-icon"
    );
  });

  it("drops the icon when hideIcon is set alongside a custom icon", () => {
    const { container } = render(
      <AlertHeader title="Payment failed" icon={<span>Custom</span>} hideIcon />
    );

    expect(container.querySelector(".alert-icon")).toBeNull();
  });

  it("does not render a dismiss button or flag the header without onDismiss", () => {
    const { container } = render(<AlertHeader title="Payment failed" />);

    expect(
      screen.queryByRole("button", { name: "Dismiss" })
    ).not.toBeInTheDocument();
    expect(container.querySelector(".alert-header")).not.toHaveAttribute(
      "data-has-dismiss"
    );
  });

  it("flags the header when a dismiss button is rendered", () => {
    const { container } = render(
      <AlertHeader title="Payment failed" onDismiss={vi.fn()} />
    );

    expect(container.querySelector(".alert-header")).toHaveAttribute(
      "data-has-dismiss",
      "true"
    );
  });

  it("calls onDismiss when the dismiss button is pressed", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(<AlertHeader title="Payment failed" onDismiss={onDismiss} />);

    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("labels the dismiss button with a custom dismissLabel", () => {
    render(
      <AlertHeader
        title="Payment failed"
        onDismiss={vi.fn()}
        dismissLabel="Close notice"
      />
    );

    expect(
      screen.getByRole("button", { name: "Close notice" })
    ).toBeInTheDocument();
  });

  it("renders custom children alongside the title", () => {
    render(
      <AlertHeader title="Payment failed">
        <span>Extra content</span>
      </AlertHeader>
    );

    expect(screen.getByText("Extra content")).toBeInTheDocument();
  });

  it("renders a div carrying the alert-header class, not a banner landmark", () => {
    const { container } = render(<AlertHeader title="Payment failed" />);

    const header = container.querySelector(".alert-header");
    expect(header?.tagName).toBe("DIV");
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
  });

  it("merges a custom className with alert-header", () => {
    const { container } = render(
      <AlertHeader title="Payment failed" className="custom-header" />
    );

    expect(container.querySelector(".alert-header")).toHaveClass(
      "alert-header",
      "custom-header"
    );
  });

  it("forwards arbitrary HTML attributes to the header element", () => {
    const { container } = render(
      <AlertHeader title="Payment failed" id="header-1" />
    );

    expect(container.querySelector(".alert-header")).toHaveAttribute(
      "id",
      "header-1"
    );
  });
});
