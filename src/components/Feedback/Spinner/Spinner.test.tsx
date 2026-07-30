import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  describe("rendering", () => {
    it("renders an element with the progressbar role", () => {
      render(<Spinner />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders the ProgressCircle track and arc", () => {
      const { container } = render(<Spinner />);

      expect(container.querySelectorAll("circle")).toHaveLength(2);
    });

    it("spins, by rendering the indeterminate rotation", () => {
      const { container } = render(<Spinner />);

      const animation = container.querySelector("animateTransform");
      expect(animation).not.toBeNull();
      expect(animation).toHaveAttribute("type", "rotate");
      expect(animation).toHaveAttribute("values", "0;360");
      expect(animation).toHaveAttribute("repeatCount", "indefinite");
    });

    it("reports no value, so the spinner reads as indeterminate", () => {
      render(<Spinner />);

      expect(screen.getByRole("progressbar")).not.toHaveAttribute(
        "aria-valuenow"
      );
    });
  });

  describe("label", () => {
    it("renders no label by default", () => {
      const { container } = render(<Spinner />);

      expect(container.querySelector("span")).toBeNull();
    });

    it("renders the label below the circle", () => {
      const { container } = render(<Spinner label="Loading invoices…" />);

      const root = container.firstElementChild;
      expect(root?.lastElementChild).toHaveTextContent("Loading invoices…");
      expect(root?.firstElementChild).toBe(screen.getByRole("progressbar"));
    });

    it("names the spinner after its visible label", () => {
      render(<Spinner label="Loading invoices…" />);

      expect(
        screen.getByRole("progressbar", { name: "Loading invoices…" })
      ).toBeInTheDocument();
    });

    it('falls back to a "Loading" name when there is no label', () => {
      render(<Spinner />);

      expect(
        screen.getByRole("progressbar", { name: "Loading" })
      ).toBeInTheDocument();
    });

    it("prefers an explicit aria-label over the fallback", () => {
      render(<Spinner aria-label="Checking your session" />);

      expect(
        screen.getByRole("progressbar", { name: "Checking your session" })
      ).toBeInTheDocument();
    });

    it("prefers an explicit aria-labelledby over the visible label", () => {
      render(
        <>
          <span id="external-label">Restoring your draft</span>
          <Spinner label="Loading…" aria-labelledby="external-label" />
        </>
      );

      expect(
        screen.getByRole("progressbar", { name: "Restoring your draft" })
      ).toBeInTheDocument();
    });

    it("treats an empty label as no label", () => {
      const { container } = render(<Spinner label="" />);

      expect(container.querySelector("span")).toBeNull();
      expect(
        screen.getByRole("progressbar", { name: "Loading" })
      ).toBeInTheDocument();
    });
  });

  describe("sizes", () => {
    it('renders a 24px circle at data-field-size="md" by default', () => {
      const { container } = render(<Spinner />);

      expect(container.firstElementChild).toHaveAttribute(
        "data-field-size",
        "md"
      );

      const progressbar = screen.getByRole("progressbar");
      expect(progressbar.style.width).toBe("24px");
      expect(progressbar.style.height).toBe("24px");
    });

    it.each([
      ["sm", "16px"],
      ["md", "24px"],
      ["lg", "32px"],
    ] as const)("renders %s at %s", (size, diameter) => {
      const { container } = render(<Spinner size={size} />);

      expect(container.firstElementChild).toHaveAttribute(
        "data-field-size",
        size
      );

      const progressbar = screen.getByRole("progressbar");
      expect(progressbar.style.width).toBe(diameter);
      expect(progressbar.style.height).toBe(diameter);
    });
  });

  describe("styling", () => {
    it("merges a custom class name with its own", () => {
      const { container } = render(<Spinner className="custom" />);

      const root = container.firstElementChild;
      expect(root).toHaveClass("custom");
      expect(root?.className).not.toBe("custom");
    });

    it("applies inline styles to the root", () => {
      const { container } = render(<Spinner style={{ marginTop: "8px" }} />);

      expect(container.firstElementChild).toHaveStyle({ marginTop: "8px" });
    });
  });
});
