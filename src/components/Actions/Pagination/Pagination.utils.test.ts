import { clampPage, getPaginationRange, range } from "./Pagination.utils";

describe("range", () => {
  it("returns an inclusive range", () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns a single element when start equals end", () => {
    expect(range(3, 3)).toEqual([3]);
  });

  it("returns an empty array when end is before start", () => {
    expect(range(5, 1)).toEqual([]);
  });
});

describe("clampPage", () => {
  it("returns the page when within range", () => {
    expect(clampPage(3, 10)).toBe(3);
  });

  it("clamps to the first page when below 1", () => {
    expect(clampPage(-2, 10)).toBe(1);
    expect(clampPage(0, 10)).toBe(1);
  });

  it("clamps to the last page when above the total", () => {
    expect(clampPage(99, 10)).toBe(10);
  });

  it("returns 1 when there are no pages", () => {
    expect(clampPage(5, 0)).toBe(1);
  });
});

describe("getPaginationRange", () => {
  it("returns an empty array when there are no pages", () => {
    expect(getPaginationRange({ page: 1, totalPages: 0 })).toEqual([]);
  });

  it("lists every page when they all fit without truncation", () => {
    expect(getPaginationRange({ page: 1, totalPages: 7 })).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it("truncates the end when near the start", () => {
    expect(getPaginationRange({ page: 1, totalPages: 10 })).toEqual([
      1,
      2,
      3,
      4,
      5,
      "ellipsis",
      10,
    ]);
  });

  it("truncates the start when near the end", () => {
    expect(getPaginationRange({ page: 10, totalPages: 10 })).toEqual([
      1,
      "ellipsis",
      6,
      7,
      8,
      9,
      10,
    ]);
  });

  it("truncates both sides when in the middle", () => {
    expect(getPaginationRange({ page: 5, totalPages: 10 })).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ]);
  });

  it("shows the hidden page instead of an ellipsis that hides a single page", () => {
    // With page 4 of 10, the gap after page 1 would only hide page 2, so it is
    // shown as a number rather than collapsed.
    expect(getPaginationRange({ page: 4, totalPages: 10 })).toEqual([
      1,
      2,
      3,
      4,
      5,
      "ellipsis",
      10,
    ]);
  });

  it("respects a larger siblingCount", () => {
    expect(
      getPaginationRange({ page: 10, totalPages: 20, siblingCount: 2 })
    ).toEqual([1, "ellipsis", 8, 9, 10, 11, 12, "ellipsis", 20]);
  });

  it("clamps an out-of-range page before computing the window", () => {
    expect(getPaginationRange({ page: 999, totalPages: 10 })).toEqual([
      1,
      "ellipsis",
      6,
      7,
      8,
      9,
      10,
    ]);
  });
});
