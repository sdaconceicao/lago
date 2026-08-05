import { render, screen } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  describe("rendering", () => {
    it("renders a box with round edges by default", () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstElementChild;
      expect(skeleton).toHaveAttribute("data-variant", "box");
      expect(skeleton).toHaveAttribute("data-edges", "round");
    });

    it("carries the shared skeleton class every shape shimmers from", () => {
      const { container } = render(<Skeleton />);

      expect(container.firstElementChild).toHaveClass("skeleton");
    });

    it("renders no content of its own", () => {
      const { container } = render(<Skeleton />);

      expect(container.firstElementChild).toBeEmptyDOMElement();
    });

    it("passes other props through to the element", () => {
      render(<Skeleton id="media" data-testid="skeleton" />);

      expect(screen.getByTestId("skeleton")).toHaveAttribute("id", "media");
    });
  });

  describe("variants", () => {
    it.each(["box", "circle", "line"] as const)("renders a %s", (variant) => {
      const { container } = render(<Skeleton variant={variant} />);

      expect(container.firstElementChild).toHaveAttribute(
        "data-variant",
        variant
      );
    });
  });

  describe("edges", () => {
    it.each(["round", "straight"] as const)("renders %s edges", (edges) => {
      const { container } = render(<Skeleton edges={edges} />);

      expect(container.firstElementChild).toHaveAttribute("data-edges", edges);
    });
  });

  describe("sizing", () => {
    it("leaves the dimensions to the stylesheet when none are given", () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstElementChild as HTMLElement;
      expect(skeleton.style.width).toBe("");
      expect(skeleton.style.height).toBe("");
    });

    it("reads numeric dimensions as pixels", () => {
      const { container } = render(<Skeleton width={240} height={80} />);

      expect(container.firstElementChild).toHaveStyle({
        width: "240px",
        height: "80px",
      });
    });

    it("uses a string dimension as given", () => {
      const { container } = render(<Skeleton width="60%" height="2rem" />);

      expect(container.firstElementChild).toHaveStyle({
        width: "60%",
        height: "2rem",
      });
    });
  });

  describe("accessibility", () => {
    it("hides an unnamed skeleton from assistive technology", () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstElementChild;
      expect(skeleton).toHaveAttribute("aria-hidden", "true");
      expect(skeleton).not.toHaveAttribute("role");
    });

    it("announces a labelled skeleton as a status", () => {
      render(<Skeleton label="Loading your invoices" />);

      const status = screen.getByRole("status", {
        name: "Loading your invoices",
      });
      expect(status).toBeInTheDocument();
      expect(status).not.toHaveAttribute("aria-hidden");
    });

    it("treats an aria-label as a label", () => {
      render(<Skeleton aria-label="Loading chart" />);

      expect(
        screen.getByRole("status", { name: "Loading chart" })
      ).toBeInTheDocument();
    });

    it("prefers the label prop over an aria-label", () => {
      render(<Skeleton label="Loading invoices" aria-label="Loading" />);

      expect(
        screen.getByRole("status", { name: "Loading invoices" })
      ).toBeInTheDocument();
    });

    it("treats an empty label as no label", () => {
      const { container } = render(<Skeleton label="" />);

      expect(container.firstElementChild).toHaveAttribute(
        "aria-hidden",
        "true"
      );
    });
  });

  describe("styling", () => {
    it("merges a custom class name with its own", () => {
      const { container } = render(<Skeleton className="custom" />);

      const skeleton = container.firstElementChild;
      expect(skeleton).toHaveClass("custom", "skeleton");
      expect(skeleton?.className).not.toBe("custom");
    });

    it("merges inline styles with the resolved dimensions", () => {
      const { container } = render(
        <Skeleton width={100} style={{ marginTop: "8px" }} />
      );

      expect(container.firstElementChild).toHaveStyle({
        width: "100px",
        marginTop: "8px",
      });
    });

    it("lets an inline style override a dimension prop", () => {
      const { container } = render(
        <Skeleton width={100} style={{ width: "50%" }} />
      );

      expect(container.firstElementChild).toHaveStyle({ width: "50%" });
    });
  });

  describe("compound components", () => {
    it("exposes the paragraph and card arrangements", () => {
      expect(Skeleton.Paragraph).toBeInstanceOf(Function);
      expect(Skeleton.Card).toBeInstanceOf(Function);
    });
  });
});
