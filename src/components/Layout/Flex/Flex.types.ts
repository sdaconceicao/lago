import type { ComponentPropsWithRef, CSSProperties, JSX } from "react";

/** Mobile-first viewport thresholds. `base` applies at every width. */
export type LayoutBreakpoint = "base" | "xs" | "sm" | "md" | "lg" | "xl";

/**
 * One value at every width, or overrides at xs (20rem), sm (40rem), md (48rem),
 * lg (64rem), and xl (80rem). Omitted keys retain the preceding value, starting
 * with the component default when `base` is omitted.
 */
export type ResponsiveValue<T> = T | Partial<Record<LayoutBreakpoint, T>>;

/**
 * A non-negative number of theme spacing units, including zero and fractions,
 * or an explicit CSS gap such as `"12px"`, `"1.5rem"`, or `"var(--gutter)"`.
 * Numeric values multiply `--spacing`, with no upper limit. Invalid numbers
 * (negative, NaN, or infinite) are ignored.
 */
export type LayoutGap = number | string;

/** Intrinsic HTML elements supported by the layout components. */
export type FlexElement = keyof HTMLElementTagNameMap &
  keyof JSX.IntrinsicElements;

/** Shared flexbox controls for Flex and its layout presets. */
export interface FlexLayoutProps {
  /** Main-axis direction. Flex defaults to `row`; Stack and VStack use `column`. */
  direction?: ResponsiveValue<NonNullable<CSSProperties["flexDirection"]>>;
  /** Cross-axis alignment. Defaults to `stretch`; HStack and Wrap use `center`. */
  align?: ResponsiveValue<NonNullable<CSSProperties["alignItems"]>>;
  /** Main-axis distribution. Defaults to `flex-start`. */
  justify?: ResponsiveValue<NonNullable<CSSProperties["justifyContent"]>>;
  /** Line wrapping. Defaults to `nowrap`; Wrap uses `wrap`. */
  wrap?: ResponsiveValue<NonNullable<CSSProperties["flexWrap"]>>;
  /** Space between children. Flex defaults to zero; the presets use four units. */
  gap?: ResponsiveValue<LayoutGap>;
  /** Space between rows. Falls back to the current `gap` when omitted. */
  rowGap?: ResponsiveValue<LayoutGap>;
  /** Space between columns. Falls back to the current `gap` when omitted. */
  columnGap?: ResponsiveValue<LayoutGap>;
  /** Uses `inline-flex` instead of `flex`. Defaults to false. */
  inline?: boolean;
}

/** Flexbox layout controls plus native attributes and a ref for the chosen element. */
export type FlexProps<T extends FlexElement = "div"> = FlexLayoutProps & {
  /** Semantic HTML element to render. Defaults to `div`. */
  elementType?: T;
} & Omit<ComponentPropsWithRef<T>, keyof FlexLayoutProps | "elementType">;
