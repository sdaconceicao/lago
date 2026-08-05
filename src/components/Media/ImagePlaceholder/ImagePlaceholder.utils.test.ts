import {
  getErrorLabel,
  getReservedSpaceStyle,
  isErrorDecorative,
  toCssLength,
} from "./ImagePlaceholder.utils";

describe("toCssLength", () => {
  it("reads a number as pixels", () => {
    expect(toCssLength(320)).toBe("320px");
  });

  it("passes a string through untouched", () => {
    expect(toCssLength("100%")).toBe("100%");
    expect(toCssLength("clamp(10rem, 40vw, 30rem)")).toBe(
      "clamp(10rem, 40vw, 30rem)"
    );
  });

  it("keeps zero as a length rather than dropping it", () => {
    expect(toCssLength(0)).toBe("0px");
  });

  it("returns undefined when nothing is given", () => {
    expect(toCssLength()).toBeUndefined();
    expect(toCssLength(undefined)).toBeUndefined();
  });
});

describe("getReservedSpaceStyle", () => {
  it("writes both dimensions when both are given", () => {
    expect(getReservedSpaceStyle(320, 180)).toEqual({
      width: "320px",
      height: "180px",
    });
  });

  it("writes only the dimensions given, leaving the rest to CSS", () => {
    expect(getReservedSpaceStyle(320)).toEqual({ width: "320px" });
    expect(getReservedSpaceStyle(undefined, "10rem")).toEqual({
      height: "10rem",
    });
  });

  it("passes an aspect ratio through unitless", () => {
    expect(getReservedSpaceStyle("100%", undefined, 16 / 9)).toEqual({
      width: "100%",
      aspectRatio: 16 / 9,
    });
    expect(getReservedSpaceStyle(undefined, undefined, "3 / 2")).toEqual({
      aspectRatio: "3 / 2",
    });
  });

  it("returns undefined when no dimension is given", () => {
    expect(getReservedSpaceStyle()).toBeUndefined();
    expect(
      getReservedSpaceStyle(undefined, undefined, undefined)
    ).toBeUndefined();
  });

  it("is pure — the same input gives an equal result every time", () => {
    const first = getReservedSpaceStyle(320, 180, 16 / 9);
    const second = getReservedSpaceStyle(320, 180, 16 / 9);

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });
});

describe("isErrorDecorative", () => {
  it("treats an empty alt as decorative", () => {
    expect(isErrorDecorative("")).toBe(true);
  });

  it("treats alt text as worth announcing", () => {
    expect(isErrorDecorative("A liberty bell")).toBe(false);
  });

  it("announces a decorative image when an error label is given", () => {
    expect(isErrorDecorative("", "Portrait unavailable")).toBe(false);
  });

  it("does not treat whitespace as empty", () => {
    expect(isErrorDecorative(" ")).toBe(false);
  });
});

describe("getErrorLabel", () => {
  it("appends the failure to the alt text", () => {
    expect(getErrorLabel("A liberty bell")).toBe(
      "A liberty bell, failed to load"
    );
  });

  it("prefers an explicit error label", () => {
    expect(getErrorLabel("A liberty bell", "Bell photo unavailable")).toBe(
      "Bell photo unavailable"
    );
  });

  it("falls back to a generic message when there is no alt text", () => {
    expect(getErrorLabel("")).toBe("Image failed to load");
  });

  it("uses an explicit label even when there is no alt text", () => {
    expect(getErrorLabel("", "Bell photo unavailable")).toBe(
      "Bell photo unavailable"
    );
  });
});
