import { render, screen } from "@testing-library/react";
import { AlertFooter } from "./AlertFooter";

describe("AlertFooter", () => {
  it("renders its children", () => {
    render(
      <AlertFooter>
        <button type="button">Retry</button>
      </AlertFooter>
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("renders a div carrying the alert-footer class", () => {
    render(<AlertFooter>Footer</AlertFooter>);

    const footer = screen.getByText("Footer");
    expect(footer.tagName).toBe("DIV");
    expect(footer).toHaveClass("alert-footer");
  });

  it("does not register a contentinfo landmark", () => {
    render(<AlertFooter>Footer</AlertFooter>);

    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });

  it("merges a custom className with alert-footer", () => {
    render(<AlertFooter className="custom-footer">Footer</AlertFooter>);

    expect(screen.getByText("Footer")).toHaveClass(
      "alert-footer",
      "custom-footer"
    );
  });

  it("forwards arbitrary HTML attributes to the footer element", () => {
    render(<AlertFooter id="footer-1">Footer</AlertFooter>);

    expect(screen.getByText("Footer")).toHaveAttribute("id", "footer-1");
  });
});
