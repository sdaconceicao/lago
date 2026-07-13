import { render, screen } from "@testing-library/react";
import { DialogFooter } from "./DialogFooter";

describe("DialogFooter", () => {
  it("renders its children", () => {
    render(<DialogFooter>Footer content</DialogFooter>);

    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("renders a footer element carrying the dialog-footer class", () => {
    render(<DialogFooter>Footer</DialogFooter>);

    const footer = screen.getByText("Footer");
    expect(footer.tagName).toBe("FOOTER");
    expect(footer).toHaveClass("dialog-footer");
  });

  it("merges a custom className with dialog-footer", () => {
    render(<DialogFooter className="custom-footer">Footer</DialogFooter>);

    expect(screen.getByText("Footer")).toHaveClass(
      "dialog-footer",
      "custom-footer"
    );
  });

  it("forwards arbitrary HTML attributes to the underlying footer", () => {
    render(
      <DialogFooter id="footer-1" data-testid="footer">
        Footer
      </DialogFooter>
    );

    const footer = screen.getByTestId("footer");
    expect(footer).toHaveAttribute("id", "footer-1");
  });
});
