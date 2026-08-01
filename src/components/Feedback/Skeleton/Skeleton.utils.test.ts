import { getSkeletonA11yProps, toCssLength } from "./Skeleton.utils";

describe("toCssLength", () => {
  it("reads a number as pixels", () => {
    expect(toCssLength(120)).toBe("120px");
  });

  it("reads zero as pixels rather than dropping it", () => {
    expect(toCssLength(0)).toBe("0px");
  });

  it("passes a CSS length through untouched", () => {
    expect(toCssLength("60%")).toBe("60%");
    expect(toCssLength("12rem")).toBe("12rem");
    expect(toCssLength("calc(100% - 8px)")).toBe("calc(100% - 8px)");
  });

  it("returns undefined for a missing value, so the stylesheet decides", () => {
    expect(toCssLength(undefined)).toBeUndefined();
    expect(toCssLength()).toBeUndefined();
  });

  it("returns the same result for the same input", () => {
    expect(toCssLength(48)).toBe(toCssLength(48));
  });
});

describe("getSkeletonA11yProps", () => {
  it("hides an unnamed skeleton from assistive technology", () => {
    expect(getSkeletonA11yProps()).toEqual({ "aria-hidden": true });
  });

  it("announces a named skeleton as a status", () => {
    expect(getSkeletonA11yProps("Loading invoices")).toEqual({
      role: "status",
      "aria-label": "Loading invoices",
    });
  });

  it("treats an empty label as no label", () => {
    expect(getSkeletonA11yProps("")).toEqual({ "aria-hidden": true });
  });

  it("returns the same result for the same input", () => {
    expect(getSkeletonA11yProps("Loading")).toEqual(
      getSkeletonA11yProps("Loading")
    );
  });
});
