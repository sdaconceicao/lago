import type React from "react";
// Direct ES module imports let consumers retain only the brands they use.
import AmexLogo from "react-payment-logos/dist/esm/flat/Amex.js";
import DinersLogo from "react-payment-logos/dist/esm/flat/Diners.js";
import DiscoverLogo from "react-payment-logos/dist/esm/flat/Discover.js";
import JcbLogo from "react-payment-logos/dist/esm/flat/Jcb.js";
import MaestroLogo from "react-payment-logos/dist/esm/flat/Maestro.js";
import MastercardLogo from "react-payment-logos/dist/esm/flat/Mastercard.js";
import UnionpayLogo from "react-payment-logos/dist/esm/flat/Unionpay.js";
import VisaLogo from "react-payment-logos/dist/esm/flat/Visa.js";
import type { CardBrand } from "./components/Inputs/CreditCardNumber/CreditCardNumber.utils";

/**
 * A brand mark: an SVG component drawn on the 780 × 500 card canvas every logo
 * in the set shares, so marks stay the same shape as the brand changes.
 */
export type CardBrandLogo = (
  props: React.SVGProps<SVGSVGElement>
) => React.ReactNode;

// CommonJS builds receive Node's ESM namespace instead of the default component.
const unwrapLogo = (
  logo: CardBrandLogo | { default: CardBrandLogo }
): CardBrandLogo => (typeof logo === "function" ? logo : logo.default);

export const Amex: CardBrandLogo = /* @__PURE__ */ unwrapLogo(AmexLogo);
export const Diners: CardBrandLogo = /* @__PURE__ */ unwrapLogo(DinersLogo);
export const Discover: CardBrandLogo = /* @__PURE__ */ unwrapLogo(DiscoverLogo);
export const Jcb: CardBrandLogo = /* @__PURE__ */ unwrapLogo(JcbLogo);
export const Maestro: CardBrandLogo = /* @__PURE__ */ unwrapLogo(MaestroLogo);
export const Mastercard: CardBrandLogo =
  /* @__PURE__ */ unwrapLogo(MastercardLogo);
export const Unionpay: CardBrandLogo = /* @__PURE__ */ unwrapLogo(UnionpayLogo);
export const Visa: CardBrandLogo = /* @__PURE__ */ unwrapLogo(VisaLogo);

/**
 * Inline SVG components from `react-payment-logos` (MIT). Install the optional
 * `react-payment-logos` and `tslib` peers when using this entry. Fixed-brand
 * interfaces can import individual components instead of retaining this map.
 */
export const CARD_BRAND_LOGOS: Record<CardBrand, CardBrandLogo> = {
  visa: Visa,
  mastercard: Mastercard,
  amex: Amex,
  discover: Discover,
  diners: Diners,
  jcb: Jcb,
  unionpay: Unionpay,
  maestro: Maestro,
};
