import { getParagraphLines } from "./SkeletonParagraph.utils";

describe("getParagraphLines", () => {
  it("draws three ragged lines by default, the last one short", () => {
    expect(getParagraphLines(3).map((line) => line.width)).toEqual([
      "100%",
      "92%",
      "68%",
    ]);
  });

  it("runs a lone line the full width, having nothing to rag against", () => {
    expect(getParagraphLines(1).map((line) => line.width)).toEqual(["100%"]);
  });

  it("keeps the last line short at any count", () => {
    const widths = getParagraphLines(6).map((line) => line.width);

    expect(widths).toEqual(["100%", "92%", "100%", "92%", "100%", "68%"]);
  });

  it("gives every line a distinct key", () => {
    const ids = getParagraphLines(5).map((line) => line.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("renders nothing for a count that cannot make a paragraph", () => {
    expect(getParagraphLines(0)).toEqual([]);
    expect(getParagraphLines(-1)).toEqual([]);
    expect(getParagraphLines(Number.NaN)).toEqual([]);
    expect(getParagraphLines(Number.POSITIVE_INFINITY)).toEqual([]);
  });

  it("rounds a fractional count down to whole lines", () => {
    expect(getParagraphLines(2.7)).toHaveLength(2);
  });

  it("returns the same result for the same input", () => {
    expect(getParagraphLines(4)).toEqual(getParagraphLines(4));
  });
});
