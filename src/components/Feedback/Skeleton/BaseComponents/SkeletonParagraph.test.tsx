import { render, screen } from "@testing-library/react";
import { SkeletonParagraph } from "./SkeletonParagraph";

const getLines = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-variant="line"]'));

describe("SkeletonParagraph", () => {
  describe("rendering", () => {
    it("renders three lines by default", () => {
      const { container } = render(<SkeletonParagraph />);

      expect(getLines(container)).toHaveLength(3);
    });

    it("rags the lines so the block reads as text", () => {
      const { container } = render(<SkeletonParagraph />);

      expect(getLines(container).map((line) => line.style.width)).toEqual([
        "100%",
        "92%",
        "68%",
      ]);
    });

    it("renders the number of lines asked for", () => {
      const { container } = render(<SkeletonParagraph lines={5} />);

      expect(getLines(container)).toHaveLength(5);
    });

    it("renders an empty paragraph for a count of zero", () => {
      const { container } = render(<SkeletonParagraph lines={0} />);

      expect(getLines(container)).toHaveLength(0);
      expect(container.firstElementChild).toBeEmptyDOMElement();
    });

    it("passes other props through to the element", () => {
      render(<SkeletonParagraph id="summary" data-testid="paragraph" />);

      expect(screen.getByTestId("paragraph")).toHaveAttribute("id", "summary");
    });
  });

  describe("edges", () => {
    it("draws round line ends by default", () => {
      const { container } = render(<SkeletonParagraph />);

      for (const line of getLines(container)) {
        expect(line).toHaveAttribute("data-edges", "round");
      }
    });

    it("passes straight edges down to every line", () => {
      const { container } = render(<SkeletonParagraph edges="straight" />);

      for (const line of getLines(container)) {
        expect(line).toHaveAttribute("data-edges", "straight");
      }
    });
  });

  describe("sizing", () => {
    it("leaves the width to the stylesheet when none is given", () => {
      const { container } = render(<SkeletonParagraph />);

      expect((container.firstElementChild as HTMLElement).style.width).toBe("");
    });

    it("reads a numeric width as pixels", () => {
      const { container } = render(<SkeletonParagraph width={320} />);

      expect(container.firstElementChild).toHaveStyle({ width: "320px" });
    });

    it("uses a string width as given", () => {
      const { container } = render(<SkeletonParagraph width="24rem" />);

      // Inline style rather than `toHaveStyle`, which resolves `24rem` to
      // `384px` through jsdom's computed style.
      expect((container.firstElementChild as HTMLElement).style.width).toBe(
        "24rem"
      );
    });

    it("applies the line height to every line", () => {
      const { container } = render(<SkeletonParagraph lineHeight={12} />);

      for (const line of getLines(container)) {
        expect(line).toHaveStyle({ height: "12px" });
      }
    });

    it("leaves the line height to the font size when none is given", () => {
      const { container } = render(<SkeletonParagraph />);

      for (const line of getLines(container)) {
        expect(line.style.height).toBe("");
      }
    });
  });

  describe("accessibility", () => {
    it("hides an unnamed paragraph from assistive technology", () => {
      const { container } = render(<SkeletonParagraph />);

      expect(container.firstElementChild).toHaveAttribute(
        "aria-hidden",
        "true"
      );
    });

    it("announces a labelled paragraph as a status", () => {
      render(<SkeletonParagraph label="Loading the description" />);

      expect(
        screen.getByRole("status", { name: "Loading the description" })
      ).toBeInTheDocument();
    });

    it("keeps the lines themselves silent inside a labelled paragraph", () => {
      const { container } = render(<SkeletonParagraph label="Loading" />);

      for (const line of getLines(container)) {
        expect(line).toHaveAttribute("aria-hidden", "true");
      }
    });
  });

  describe("styling", () => {
    it("merges a custom class name with its own", () => {
      const { container } = render(<SkeletonParagraph className="custom" />);

      const paragraph = container.firstElementChild;
      expect(paragraph).toHaveClass("custom", "skeleton-paragraph");
      expect(paragraph?.className).not.toBe("custom");
    });

    it("applies inline styles to the root", () => {
      const { container } = render(
        <SkeletonParagraph style={{ marginTop: "8px" }} />
      );

      expect(container.firstElementChild).toHaveStyle({ marginTop: "8px" });
    });
  });
});
