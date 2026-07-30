"use client";
import clsx from "clsx";
import { ImageOff } from "lucide-react";
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactEventHandler,
  ReactNode,
} from "react";
import { ImageGlyph, type ImageGlyphProps } from "./BaseComponents/ImageGlyph";
import { type ImageStatus, useImageStatus } from "./ImagePlaceholder.hooks";
import styles from "./ImagePlaceholder.module.css";
import {
  getErrorLabel,
  getReservedSpaceStyle,
  type ImageDimension,
  isErrorDecorative,
} from "./ImagePlaceholder.utils";

/**
 * What is drawn in the reserved space before the image arrives.
 *
 * - `"surface"` — a plain tinted panel, which shimmers while an image is on
 *   its way. The quietest option, and the right one for a grid of many boxes
 *   where a mark in every cell would be noise.
 * - `"image"` — the same panel with a framed-landscape mark centred in it,
 *   which says a picture is what is missing. Worth it for a single large slot,
 *   such as a hero or an upload target.
 */
export type PlaceholderKind = "surface" | "image";

/** What a placeholder draws when no `placeholder` prop is passed. */
export const DEFAULT_PLACEHOLDER: PlaceholderKind = "surface";

/**
 * The props ImagePlaceholder owns. Everything else is forwarded to whatever
 * `as` renders, so the standard image attributes — `sizes`, `srcSet`,
 * `crossOrigin`, `referrerPolicy`, `fetchPriority` — and every a11y attribute —
 * `aria-*`, `role`, `title`, `lang` — pass straight through.
 */
export interface ImagePlaceholderOwnProps {
  /**
   * URL of the image. While it loads the placeholder shimmers; if it cannot be
   * loaded the error state replaces it. Leave it off and the placeholder holds
   * the space without shimmering, for a slot that has nothing in it yet.
   */
  src?: string;
  /**
   * Alternative text for the image. Required, as it is on an `<img>`. Pass an
   * empty string for a decorative image that repeats something already written
   * beside it — the error state is then hidden from assistive technology too,
   * unless `errorLabel` says otherwise.
   */
  alt: string;
  /**
   * Forces the shimmering loading state on. Use it while the record that will
   * supply `src` is itself still being fetched — without it, a placeholder with
   * no `src` rests quietly rather than promising an image that may never come.
   *
   * @default false
   */
  isLoading?: boolean;
  /**
   * What is drawn in the reserved space before the image arrives: `surface`
   * for a plain tinted panel, or `image` to centre a framed-landscape mark in
   * it. Either way the panel shimmers while an image is loading, and neither is
   * announced — the mark is decoration over space that is already held.
   *
   * Note this shadows `next/image`'s own `placeholder` prop when one is passed
   * to `as`; the two solve the same problem, and this one is the one in charge.
   *
   * @default 'surface'
   */
  placeholder?: PlaceholderKind;
  /**
   * Width of the reserved space, as a number of pixels or any CSS length. Also
   * forwarded to the image, so the browser can size it before it arrives.
   */
  width?: ImageDimension;
  /**
   * Height of the reserved space, as a number of pixels or any CSS length.
   * Also forwarded to the image.
   */
  height?: ImageDimension;
  /**
   * Shape of the reserved space, as a ratio — `16 / 9`, or `"3 / 2"`. Pair it
   * with a `width` of `"100%"` for a box that keeps its proportions as the
   * column around it changes size.
   */
  aspectRatio?: number | string;
  /**
   * Text of the error status code shown when the image fails to load.
   *
   * @default '400'
   */
  errorCode?: ReactNode;
  /**
   * Message shown under the status code when the image fails to load. It is
   * dropped automatically when the reserved space is too narrow to fit it.
   *
   * @default 'Image unavailable'
   */
  errorMessage?: ReactNode;
  /**
   * Accessible name announced for the error state. Defaults to the alt text
   * with the failure appended, so it is clear which image is missing. Setting
   * it also forces the error to be announced for a decorative image.
   */
  errorLabel?: string;
  /** CSS class name for custom styling. Merged with the component's default classes. */
  className?: string;
  /** CSS class name applied to the image itself rather than the box around it. */
  imageClassName?: string;
  /** Inline styles for the box. Merged over the reserved-space dimensions. */
  style?: CSSProperties;
}

/**
 * Props for the ImagePlaceholder component.
 *
 * `as` accepts anything that renders an image from `src`, `alt`, `className`,
 * `onLoad` and `onError` — a plain `"img"` by default, or a framework component
 * such as `next/image`. Its own props are type-checked once it is passed, so
 * `next/image`'s `priority` or `quality` are accepted without this library
 * depending on Next at all.
 */
export type ImagePlaceholderProps<C extends ElementType = "img"> =
  ImagePlaceholderOwnProps & {
    /**
     * The element or component that renders the image.
     *
     * @default 'img'
     */
    as?: C;
  } & Omit<ComponentPropsWithoutRef<C>, keyof ImagePlaceholderOwnProps | "as">;

/** The shape of the props once past the generic boundary. */
type ResolvedProps = ImagePlaceholderOwnProps & {
  as?: ElementType;
  onLoad?: ReactEventHandler<HTMLImageElement>;
  onError?: ReactEventHandler<HTMLImageElement>;
} & Record<string, unknown>;

/**
 * An image that holds its space from the first paint: it shimmers while
 * loading, fades the picture in once it decodes, and shows a 400 error in the
 * same box if the source cannot be loaded.
 */
export function ImagePlaceholder<C extends ElementType = "img">(
  props: ImagePlaceholderProps<C>
) {
  const {
    as,
    src,
    alt,
    isLoading = false,
    placeholder = DEFAULT_PLACEHOLDER,
    width,
    height,
    aspectRatio,
    errorCode = "400",
    errorMessage = "Image unavailable",
    errorLabel,
    className,
    imageClassName,
    style,
    onLoad,
    onError,
    ...imageProps
  } = props as unknown as ResolvedProps;

  const {
    status: resolvedStatus,
    markLoaded,
    markError,
    settleFromNode,
  } = useImageStatus(src);

  // An explicit `isLoading` outranks whatever the image itself is doing: the
  // caller knows the data behind it has not arrived yet.
  const status: ImageStatus = isLoading ? "loading" : resolvedStatus;

  const Component = (as ?? "img") as ElementType;
  const reservedSpace = getReservedSpaceStyle(width, height, aspectRatio);

  const handleLoad: ReactEventHandler<HTMLImageElement> = (event) => {
    markLoaded();
    onLoad?.(event);
  };

  const handleError: ReactEventHandler<HTMLImageElement> = (event) => {
    markError();
    onError?.(event);
  };

  return (
    <span
      className={clsx("image-placeholder", styles.imagePlaceholder, className)}
      style={reservedSpace ? { ...reservedSpace, ...style } : style}
      data-status={status}
    >
      {status !== "error" && src && (
        <Component
          ref={settleFromNode}
          src={src}
          alt={alt}
          width={width}
          height={height}
          // Only meaningful on a real <img>; a component that wraps one owns
          // its own loading strategy and may not accept these at all.
          {...(Component === "img"
            ? { loading: "lazy" as const, decoding: "async" as const }
            : null)}
          {...imageProps}
          className={clsx(
            "image-placeholder-image",
            styles.image,
            imageClassName
          )}
          data-loaded={status === "loaded"}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {(status === "empty" || status === "loading") && (
        <span
          className={clsx("image-placeholder-surface", styles.surface)}
          aria-hidden="true"
        >
          {placeholder === "image" && <ImageGlyph className={styles.glyph} />}
        </span>
      )}
      {status === "error" && (
        <span
          className={clsx("image-placeholder-error", styles.error)}
          {...(isErrorDecorative(alt, errorLabel)
            ? { "aria-hidden": true }
            : { role: "img", "aria-label": getErrorLabel(alt, errorLabel) })}
        >
          <ImageOff className={styles.errorIcon} aria-hidden="true" />
          {errorCode !== null && errorCode !== false && (
            <span className={styles.errorCode}>{errorCode}</span>
          )}
          {errorMessage !== null && errorMessage !== false && (
            <span className={styles.errorMessage}>{errorMessage}</span>
          )}
        </span>
      )}
    </span>
  );
}

export type { ImageDimension, ImageGlyphProps, ImageStatus };
export { ImageGlyph };
