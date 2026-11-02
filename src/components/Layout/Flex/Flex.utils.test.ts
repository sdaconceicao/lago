import { describe, expect, it } from "vitest";
import type { FlexLayoutProps } from "./Flex.types";
import { getFlexStyle, withLayoutDefault } from "./Flex.utils";

describe("withLayoutDefault", () => {
  it("uses the preset fallback only when the value is omitted", () => {
    expect(withLayoutDefault(undefined, "column")).toBe("column");
    expect(withLayoutDefault("row", "column")).toBe("row");
    expect(withLayoutDefault(0, 4)).toBe(0);
  });

  it("starts sparse responsive overrides from the preset fallback", () => {
    expect(withLayoutDefault({ md: "row" }, "column")).toEqual({
      base: "column",
      md: "row",
    });
    expect(withLayoutDefault({ base: undefined, lg: 6 }, 4)).toEqual({
      base: 4,
      lg: 6,
    });
    expect(withLayoutDefault({}, "center")).toEqual({ base: "center" });
  });

  it("keeps explicit base overrides, including zero", () => {
    expect(withLayoutDefault({ base: "row", md: "column" }, "column")).toEqual({
      base: "row",
      md: "column",
    });
    expect(withLayoutDefault({ base: 0, md: 2 }, 4)).toEqual({
      base: 0,
      md: 2,
    });
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "restores the preset fallback for invalid spacing %s",
    (gap) => {
      expect(withLayoutDefault(gap, 4)).toBe(4);
      expect(withLayoutDefault({ base: gap, md: 6 }, 4)).toEqual({
        base: 4,
        md: 6,
      });
    }
  );

  it("leaves the caller's responsive object unchanged", () => {
    const value = Object.freeze({ md: "row" } as const);
    expect(withLayoutDefault(value, "column")).toEqual({
      base: "column",
      md: "row",
    });
    expect(value).toEqual({ md: "row" });
  });
});

describe("getFlexStyle", () => {
  it("leaves omitted layout values to the stylesheet", () => {
    expect(getFlexStyle({})).toEqual({});
    expect(getFlexStyle({ gap: undefined, direction: undefined })).toEqual({});
  });

  it("maps scalar layout values to base custom properties", () => {
    expect(
      getFlexStyle({
        direction: "column",
        align: "center",
        justify: "space-between",
        wrap: "wrap",
      })
    ).toEqual({
      "--flex-direction-base": "column",
      "--flex-align-base": "center",
      "--flex-justify-base": "space-between",
      "--flex-wrap-base": "wrap",
    });
  });

  it("keeps sparse responsive values at their named breakpoints", () => {
    expect(
      getFlexStyle({
        direction: { base: "column", sm: "row", xl: "column-reverse" },
        align: { xs: "center", md: "stretch" },
        justify: { lg: "space-between" },
        wrap: { md: "wrap" },
      })
    ).toEqual({
      "--flex-direction-base": "column",
      "--flex-direction-sm": "row",
      "--flex-direction-xl": "column-reverse",
      "--flex-align-xs": "center",
      "--flex-align-md": "stretch",
      "--flex-justify-lg": "space-between",
      "--flex-wrap-md": "wrap",
    });
  });

  it("does not invent a base value for an empty or breakpoint-only object", () => {
    expect(getFlexStyle({ direction: {}, align: { md: undefined } })).toEqual(
      {}
    );
    expect(getFlexStyle({ gap: { md: 4 } })).toEqual({
      "--flex-gap-md": "calc(var(--spacing) * 4)",
    });
  });

  it.each([0, 1, 2.5, 12])(
    "reads numeric gap %s as theme spacing units",
    (gap) => {
      expect(getFlexStyle({ gap })).toEqual({
        "--flex-gap-base": `calc(var(--spacing) * ${gap})`,
      });
    }
  );

  it("resolves both gap axes independently from the shared gap", () => {
    expect(
      getFlexStyle({
        gap: 2,
        rowGap: { base: 0, md: 3 },
        columnGap: { sm: "1rem", lg: 6 },
      })
    ).toEqual({
      "--flex-gap-base": "calc(var(--spacing) * 2)",
      "--flex-row-gap-base": "calc(var(--spacing) * 0)",
      "--flex-row-gap-md": "calc(var(--spacing) * 3)",
      "--flex-column-gap-sm": "1rem",
      "--flex-column-gap-lg": "calc(var(--spacing) * 6)",
    });
  });

  it.each([
    "12px",
    "1.5rem",
    "10%",
    "var(--custom-gap)",
    "clamp(4px, 1vw, 16px)",
  ])("preserves the CSS gap string %s", (gap) => {
    expect(getFlexStyle({ gap })).toEqual({ "--flex-gap-base": gap });
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "ignores invalid numeric gap %s on every axis",
    (gap) => {
      expect(
        getFlexStyle({ gap, rowGap: gap, columnGap: { md: gap } })
      ).toEqual({});
    }
  );

  it("retains valid responsive gaps alongside invalid values", () => {
    expect(
      getFlexStyle({ gap: { base: 0, sm: -1, md: 3, lg: Number.NaN } })
    ).toEqual({
      "--flex-gap-base": "calc(var(--spacing) * 0)",
      "--flex-gap-md": "calc(var(--spacing) * 3)",
    });
  });

  it("does not mutate responsive inputs", () => {
    const direction = Object.freeze({ base: "column", md: "row" } as const);
    const gap = Object.freeze({ base: 0, lg: 2.5 });
    const props: FlexLayoutProps = Object.freeze({ direction, gap });

    const first = getFlexStyle(props);
    const second = getFlexStyle(props);

    expect(second).toEqual(first);
    expect(props).toEqual({
      direction: { base: "column", md: "row" },
      gap: { base: 0, lg: 2.5 },
    });
  });
});
