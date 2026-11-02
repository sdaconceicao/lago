import type { CSSProperties } from "react";
import type {
  FlexLayoutProps,
  LayoutBreakpoint,
  ResponsiveValue,
} from "./Flex.types";

const breakpoints: LayoutBreakpoint[] = ["base", "xs", "sm", "md", "lg", "xl"];

function isInvalidSpacing(value: string | number | undefined): boolean {
  return typeof value === "number" && (!Number.isFinite(value) || value < 0);
}

/** Keeps a preset's base value when a responsive override starts at a later width. */
export function withLayoutDefault<T extends string | number>(
  value: ResponsiveValue<T> | undefined,
  fallback: T
): ResponsiveValue<T> {
  const base = typeof value === "object" ? value.base : value;
  const resolvedBase =
    base === undefined || isInvalidSpacing(base) ? fallback : base;
  return typeof value === "object"
    ? { ...value, base: resolvedBase }
    : resolvedBase;
}

/** Converts only supplied layout values into scoped, responsive CSS variables. */
export function getFlexStyle({
  direction,
  align,
  justify,
  wrap,
  gap,
  rowGap,
  columnGap,
}: Omit<FlexLayoutProps, "inline">): CSSProperties {
  const style: Record<string, string> = {};
  const properties = {
    direction,
    align,
    justify,
    wrap,
    gap,
    "row-gap": rowGap,
    "column-gap": columnGap,
  };

  for (const [property, value] of Object.entries(properties)) {
    if (value === undefined) continue;
    const values = typeof value === "object" ? value : { base: value };

    for (const breakpoint of breakpoints) {
      const current = values[breakpoint];
      if (current === undefined) continue;
      if (isInvalidSpacing(current)) continue;

      style[`--flex-${property}-${breakpoint}`] =
        typeof current === "number"
          ? `calc(var(--spacing) * ${current})`
          : current;
    }
  }

  return style;
}
