"use client";
import clsx from "clsx";
import { Image as ImageIcon, ImageOff } from "lucide-react";
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactEventHandler,
  ReactNode,
} from "react";
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
 *   its way.
 * - `"image"` — the same panel with a framed-landscape mark centred in it,
 *   which says a picture is what is missing. It is the picture counterpart of
 *   the crossed-out mark the error state shows, so a slot that is waiting and a
 *   slot that has failed read as one family.
 *
 * Either can be swapped for something of the caller's own with
 * `placeholderContent`.
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
   * Something of the caller's own to centre in the reserved space instead of the
   * built-in mark — an `<img>`, an inline SVG, a brand mark, any node at all. It
   * is drawn whatever `placeholder` is set to, with the same shimmer behind it,
   * and hidden from assistive technology along with the panel: like the built-in
   * mark, it decorates space that is already held. An oversized image is scaled
   * down to the reserved space rather than escaping it.
   */
  placeholderContent?: ReactNode;
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
  /**
   * CSS class name for custom styling. Merged with the component's default
   * classes — and with the image's own once it has loaded, since the image is
   * the box from then on.
   */
  className?: string;
  /** CSS class name applied to the image itself rather than the box around it. */
  imageClassName?: string;
  /** Inline styles for the box. Merged over the reserved-space dimensions. */
  style?: CSSProperties;
}

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
 * same box if the source cannot be loaded. Once the picture is on screen the box
 * has done its job and is dropped, leaving the image alone in the markup.
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
    placeholderContent,
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

  const status: ImageStatus = isLoading ? "loading" : resolvedStatus;
  const isLoaded = status === "loaded";
  const Component = (as ?? "img") as ElementType;
  const reservedSpace = getReservedSpaceStyle(width, height, aspectRatio);

  // What it takes to be the box that holds the space — worn by the wrapper until
  // the picture arrives, and by the image itself from then on.
  const boxClassName = clsx(
    "image-placeholder",
    styles.imagePlaceholder,
    className
  );
  const boxStyle = reservedSpace ? { ...reservedSpace, ...style } : style;

  const handleLoad: ReactEventHandler<HTMLImageElement> = (event) => {
    markLoaded();
    onLoad?.(event);
  };

  const handleError: ReactEventHandler<HTMLImageElement> = (event) => {
    markError();
    onError?.(event);
  };

  const image =
    src && status !== "error" ? (
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
          isLoaded ? [boxClassName, styles.loadedImage] : styles.image,
          imageClassName
        )}
        style={isLoaded ? boxStyle : undefined}
        data-status={isLoaded ? status : undefined}
        data-loaded={isLoaded}
        // The standalone image loads a second time as it mounts, which is the
        // same picture arriving again rather than news: it settles nothing and is
        // not passed on. A later failure still is — a picture can go missing
        // after it has been shown.
        onLoad={isLoaded ? undefined : handleLoad}
        onError={handleError}
      />
    ) : null;

  // Once the picture is on screen there is nothing left for a box to hold, so
  // the image takes over the class names, the reserved dimensions and the status
  // and stands on its own rather than leaving a wrapper behind it.
  if (isLoaded) return image;

  return (
    <span className={boxClassName} style={boxStyle} data-status={status}>
      {image}
      {(status === "empty" || status === "loading") && (
        <span
          className={clsx("image-placeholder-surface", styles.surface)}
          aria-hidden="true"
        >
          {placeholderContent ??
            (placeholder === "image" && (
              <ImageIcon className={styles.glyph} aria-hidden="true" />
            ))}
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

export type { ImageDimension, ImageStatus };
