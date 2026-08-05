import type { CSSProperties } from "react";

/**
 * A dimension passed to `ImagePlaceholder`. A number is a count of pixels,
 * matching the `width` and `height` attributes of an `<img>`; a string is any
 * CSS length, so `"100%"`, `"20rem"` and `"clamp(10rem, 40vw, 30rem)"` all work.
 */
export type ImageDimension = number | string;

/**
 * Turns a dimension prop into a CSS length: numbers become pixels, strings pass
 * through untouched, and `undefined` stays `undefined` so the caller can leave
 * the property off the style object entirely.
 */
export const toCssLength = (value?: ImageDimension): string | undefined =>
  typeof value === "number" ? `${value}px` : value;

/**
 * Builds the inline style that reserves the space the placeholder fills before
 * the image arrives.
 *
 * Only the dimensions actually given are written, so anything left off can
 * still be set in CSS. Returns `undefined` when nothing was given at all, which
 * keeps the `style` attribute off the element.
 */
export const getReservedSpaceStyle = (
  width?: ImageDimension,
  height?: ImageDimension,
  aspectRatio?: number | string
): CSSProperties | undefined => {
  const style: CSSProperties = {};

  const cssWidth = toCssLength(width);
  if (cssWidth !== undefined) style.width = cssWidth;

  const cssHeight = toCssLength(height);
  if (cssHeight !== undefined) style.height = cssHeight;

  // `aspect-ratio` is unitless, so a number is passed through as written.
  if (aspectRatio !== undefined) style.aspectRatio = aspectRatio;

  return Object.keys(style).length > 0 ? style : undefined;
};

/** Whether the error state should be hidden from assistive technology. */
export const isErrorDecorative = (alt: string, errorLabel?: string): boolean =>
  alt === "" && errorLabel === undefined;

/**
 * The accessible name for the error state: `errorLabel` when given, otherwise
 * the alt text with the failure appended, so a screen reader hears which image
 * is missing rather than an unattached error.
 */
export const getErrorLabel = (alt: string, errorLabel?: string): string =>
  errorLabel ??
  (alt === "" ? "Image failed to load" : `${alt}, failed to load`);
