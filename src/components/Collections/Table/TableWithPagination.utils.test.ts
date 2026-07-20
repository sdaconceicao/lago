import { getPageCount, paginate } from "./TableWithPagination.utils";

describe("getPageCount", () => {
  it("computes the number of pages for a full division", () => {
    expect(getPageCount(20, 10)).toBe(2);
  });

  it("rounds up a partial final page", () => {
    expect(getPageCount(21, 10)).toBe(3);
  });

  it("returns 0 when there are no items", () => {
    expect(getPageCount(0, 10)).toBe(0);
  });

  it("treats a non-positive rowsPerPage as a single page", () => {
    expect(getPageCount(15, 0)).toBe(1);
    expect(getPageCount(15, -5)).toBe(1);
  });
});

describe("paginate", () => {
  const items = [1, 2, 3, 4, 5, 6, 7];

  it("returns the first page slice", () => {
    expect(paginate(items, 1, 3)).toEqual([1, 2, 3]);
  });

  it("returns a middle page slice", () => {
    expect(paginate(items, 2, 3)).toEqual([4, 5, 6]);
  });

  it("returns a short final page slice", () => {
    expect(paginate(items, 3, 3)).toEqual([7]);
  });

  it("returns an empty slice for pages beyond the range", () => {
    expect(paginate(items, 4, 3)).toEqual([]);
  });

  it("returns an empty slice for non-positive pages", () => {
    expect(paginate(items, 0, 3)).toEqual([]);
  });

  it("returns the full list when rowsPerPage is non-positive", () => {
    expect(paginate(items, 1, 0)).toEqual(items);
  });

  it("does not mutate the original array", () => {
    const original = [...items];
    paginate(items, 1, 3);
    expect(items).toEqual(original);
  });
});
