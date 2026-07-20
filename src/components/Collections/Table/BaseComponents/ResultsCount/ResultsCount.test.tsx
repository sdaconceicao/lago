import { render, screen } from "@testing-library/react";
import { ResultsCount, defaultResultsTemplate } from "./ResultsCount";

describe("defaultResultsTemplate", () => {
  it("formats a populated range", () => {
    expect(defaultResultsTemplate({ from: 1, to: 10, total: 25 })).toBe(
      "Showing 1 to 10 of 25 results"
    );
  });

  it("returns a friendly message when there are no results", () => {
    expect(defaultResultsTemplate({ from: 0, to: 0, total: 0 })).toBe(
      "No results"
    );
  });

  it("formats large numbers with locale separators", () => {
    expect(defaultResultsTemplate({ from: 1, to: 10, total: 1000 })).toBe(
      "Showing 1 to 10 of 1,000 results"
    );
  });
});

describe("ResultsCount", () => {
  it("renders the default 'Showing x to y of z results' string", () => {
    render(<ResultsCount from={1} to={10} total={42} />);
    expect(
      screen.getByText("Showing 1 to 10 of 42 results")
    ).toBeInTheDocument();
  });

  it("exposes the summary as a live status region", () => {
    render(<ResultsCount from={1} to={10} total={42} />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Showing 1 to 10 of 42 results");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("supports a custom template", () => {
    render(
      <ResultsCount
        from={11}
        to={20}
        total={42}
        template={({ from, to, total }) => `${from}-${to} / ${total}`}
      />
    );
    expect(screen.getByText("11-20 / 42")).toBeInTheDocument();
  });

  it("supports a rich ReactNode template", () => {
    render(
      <ResultsCount
        from={1}
        to={5}
        total={5}
        template={({ total }) => <strong>{total} items</strong>}
      />
    );
    const strong = screen.getByText("5 items");
    expect(strong.tagName).toBe("STRONG");
  });

  it("merges a custom className", () => {
    render(<ResultsCount from={1} to={5} total={5} className="custom" />);
    expect(screen.getByRole("status")).toHaveClass("custom");
  });
});
