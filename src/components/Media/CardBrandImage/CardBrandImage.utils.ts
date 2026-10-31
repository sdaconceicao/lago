import type { CardBrand } from "@/components/Inputs/CreditCardNumber/CreditCardNumber.utils";

const DEFAULT_CARD_LOGO_CDN_URL =
  "https://cdn.jsdelivr.net/gh/iamgutz/react-payment-logos@d90ff73460cad65ab68289d51b795545c63f7f04/src/svg/flat/";

/** The SVG URL for a card brand, using the pinned CDN or a self-hosted base path. */
export const getCardBrandLogoUrl = (
  brand: CardBrand,
  cdnUrl = DEFAULT_CARD_LOGO_CDN_URL
): string =>
  `${cdnUrl}${cdnUrl && !cdnUrl.endsWith("/") ? "/" : ""}${brand}.svg`;
