import { render, screen } from "@testing-library/react";
import { DialogHeader } from "./DialogHeader";

describe("DialogHeader", () => {
  it("renders the title as a heading", () => {
    render(<DialogHeader title="Sign up" />);

    expect(
      screen.getByRole("heading", { name: "Sign up" })
    ).toBeInTheDocument();
  });

  it("renders the subtitle with the dialog-subtitle class", () => {
    render(<DialogHeader title="Sign up" subtitle="Enter your details" />);

    const subtitle = screen.getByText("Enter your details");
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveClass("dialog-subtitle");
  });

  it("renders a subtitle even when no title is provided", () => {
    render(<DialogHeader subtitle="Standalone subtitle" />);

    expect(screen.getByText("Standalone subtitle")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("omits the text wrapper when neither title nor subtitle is provided", () => {
    const { container } = render(<DialogHeader />);

    expect(container.querySelector(".dialog-header-text")).toBeNull();
  });

  it("renders a featured icon inside a bordered tile", () => {
    render(<DialogHeader title="Sign up" icon={<span>Icon</span>} />);

    expect(screen.getByText("Icon").parentElement).toHaveClass(
      "dialog-header-icon"
    );
  });

  it("does not render an icon tile when no icon is provided", () => {
    const { container } = render(<DialogHeader title="Sign up" />);

    expect(container.querySelector(".dialog-header-icon")).toBeNull();
  });

  it("renders a close button with an accessible label by default", () => {
    render(<DialogHeader title="Sign up" />);

    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("hides the close button and flags the header when hideCloseButton is set", () => {
    render(<DialogHeader title="Sign up" hideCloseButton />);

    expect(
      screen.queryByRole("button", { name: "Close" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveClass("dialog-header--no-close");
  });

  it("renders custom children alongside the title", () => {
    render(
      <DialogHeader title="Sign up">
        <span>Extra content</span>
      </DialogHeader>
    );

    expect(screen.getByText("Extra content")).toBeInTheDocument();
  });

  it("renders a header element carrying the dialog-header class", () => {
    render(<DialogHeader title="Sign up" />);

    const header = screen.getByRole("banner");
    expect(header.tagName).toBe("HEADER");
    expect(header).toHaveClass("dialog-header");
    expect(header).not.toHaveClass("dialog-header--no-close");
  });

  it("merges a custom className with dialog-header", () => {
    render(<DialogHeader title="Sign up" className="custom-header" />);

    expect(screen.getByRole("banner")).toHaveClass(
      "dialog-header",
      "custom-header"
    );
  });

  it("forwards arbitrary HTML attributes to the header element", () => {
    render(<DialogHeader title="Sign up" id="header-1" />);

    expect(screen.getByRole("banner")).toHaveAttribute("id", "header-1");
  });
});
