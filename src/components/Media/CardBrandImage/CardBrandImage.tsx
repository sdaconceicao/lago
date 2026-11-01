"use client";
import clsx from "clsx";
import { CreditCard } from "lucide-react";
import type { HTMLAttributes } from "react";
import type { CardBrand } from "@/components/Inputs/CreditCardNumber/CreditCardNumber.utils";
import { useImageStatus } from "@/components/Media/ImagePlaceholder/ImagePlaceholder.hooks";
import styles from "./CardBrandImage.module.css";
import { getCardBrandLogoUrl } from "./CardBrandImage.utils";

export interface CardBrandImageProps
  extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    "children" | "role" | "aria-label" | "aria-hidden"
  > {
  /** Card brand to display. Null shows a generic card icon without requesting an image. */
  brand: CardBrand | null;
  /** Base URL for lowercase brand SVG filenames. Defaults to commit-pinned react-payment-logos on jsDelivr; supports self-hosting. */
  cdnUrl?: string;
  /** Accessible name for the mark and its fallback. Defaults to an empty string for a decorative image. */
  alt?: string;
  /** CSS class merged with the image container's default styles. */
  className?: string;
}

/** A CDN-backed card mark with a stable aspect ratio and a generic-card fallback. */
export function CardBrandImage({
  brand,
  cdnUrl,
  alt = "",
  className,
  ...props
}: CardBrandImageProps) {
  const src = brand === null ? undefined : getCardBrandLogoUrl(brand, cdnUrl);
  const { status, markLoaded, markError, settleFromNode } = useImageStatus(src);

  return (
    <span
      {...props}
      className={clsx(styles.cardBrandImage, className)}
      role="img"
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      {src && status !== "error" ? (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          width={780}
          height={500}
          decoding="async"
          className={styles.image}
          ref={settleFromNode}
          onLoad={markLoaded}
          onError={markError}
        />
      ) : (
        <CreditCard aria-hidden="true" className={styles.fallback} />
      )}
    </span>
  );
}

export { getCardBrandLogoUrl } from "./CardBrandImage.utils";
