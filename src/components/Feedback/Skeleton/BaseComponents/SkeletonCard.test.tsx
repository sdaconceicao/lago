import { render, screen } from "@testing-library/react";
import { SkeletonCard } from "./SkeletonCard";

const getBox = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-variant="box"]');

const getLine = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-variant="line"]');

describe("SkeletonCard", () => {
  describe("rendering", () => {
    it("renders a box with a line below it", () => {
      const { container } = render(<SkeletonCard />);

      const card = container.firstElementChild;
      expect(card?.children).toHaveLength(2);
      expect(card?.firstElementChild).toBe(getBox(container));
      expect(card?.lastElementChild).toBe(getLine(container));
    });

    it("passes other props through to the element", () => {
      render(<SkeletonCard id="tile" data-testid="card" />);

      expect(screen.getByTestId("card")).toHaveAttribute("id", "tile");
    });
  });

  describe("edges", () => {
    it("draws round corners by default", () => {
      const { container } = render(<SkeletonCard />);

      expect(getBox(container)).toHaveAttribute("data-edges", "round");
      expect(getLine(container)).toHaveAttribute("data-edges", "round");
    });

    it("passes straight edges down to both shapes", () => {
      const { container } = render(<SkeletonCard edges="straight" />);

      expect(getBox(container)).toHaveAttribute("data-edges", "straight");
      expect(getLine(container)).toHaveAttribute("data-edges", "straight");
    });
  });

  describe("sizing", () => {
    it("leaves the dimensions to the stylesheet when none are given", () => {
      const { container } = render(<SkeletonCard />);

      expect((container.firstElementChild as HTMLElement).style.width).toBe("");
      expect(getBox(container)?.style.height).toBe("");
      expect(getLine(container)?.style.height).toBe("");
    });

    it("reads a numeric width as pixels", () => {
      const { container } = render(<SkeletonCard width={280} />);

      expect(container.firstElementChild).toHaveStyle({ width: "280px" });
    });

    it("uses a string width as given", () => {
      const { container } = render(<SkeletonCard width="50%" />);

      expect(container.firstElementChild).toHaveStyle({ width: "50%" });
    });

    it("applies the height to the box, not to the card", () => {
      const { container } = render(<SkeletonCard height={200} />);

      expect(getBox(container)).toHaveStyle({ height: "200px" });
      expect((container.firstElementChild as HTMLElement).style.height).toBe(
        ""
      );
    });

    it("applies the line height to the line, not to the box", () => {
      const { container } = render(<SkeletonCard lineHeight="1.5rem" />);

      expect(getLine(container)).toHaveStyle({ height: "1.5rem" });
      expect(getBox(container)?.style.height).toBe("");
    });
  });

  describe("accessibility", () => {
    it("hides an unnamed card from assistive technology", () => {
      const { container } = render(<SkeletonCard />);

      expect(container.firstElementChild).toHaveAttribute(
        "aria-hidden",
        "true"
      );
    });

    it("announces a labelled card as a status", () => {
      render(<SkeletonCard label="Loading the report" />);

      expect(
        screen.getByRole("status", { name: "Loading the report" })
      ).toBeInTheDocument();
    });

    it("keeps the shapes themselves silent inside a labelled card", () => {
      const { container } = render(<SkeletonCard label="Loading" />);

      expect(getBox(container)).toHaveAttribute("aria-hidden", "true");
      expect(getLine(container)).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("styling", () => {
    it("merges a custom class name with its own", () => {
      const { container } = render(<SkeletonCard className="custom" />);

      const card = container.firstElementChild;
      expect(card).toHaveClass("custom", "skeleton-card");
      expect(card?.className).not.toBe("custom");
    });

    it("applies inline styles to the root", () => {
      const { container } = render(
        <SkeletonCard style={{ marginTop: "8px" }} />
      );

      expect(container.firstElementChild).toHaveStyle({ marginTop: "8px" });
    });
  });
});
