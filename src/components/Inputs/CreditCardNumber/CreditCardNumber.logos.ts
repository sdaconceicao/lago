import type React from "react";
// Each logo is imported from its own ES module rather than from the package
// barrel, which has no `sideEffects` flag and would pull all fifty-odd payment
// marks into the bundle. The `dist/esm` build is the one a bundler can shake;
// `dist/flat` is CommonJS and would survive as an opaque require.
import Amex from "react-payment-logos/dist/esm/flat/Amex";
import Diners from "react-payment-logos/dist/esm/flat/Diners";
import Discover from "react-payment-logos/dist/esm/flat/Discover";
import Jcb from "react-payment-logos/dist/esm/flat/Jcb";
import Maestro from "react-payment-logos/dist/esm/flat/Maestro";
import Mastercard from "react-payment-logos/dist/esm/flat/Mastercard";
import Unionpay from "react-payment-logos/dist/esm/flat/Unionpay";
import Visa from "react-payment-logos/dist/esm/flat/Visa";
import type { CardBrand } from "./CreditCardNumber.utils";

/**
 * A brand mark: an SVG component drawn on the 780 × 500 card canvas every logo
 * in the set shares, so marks stay the same shape as the brand changes.
 */
export type CardBrandLogo = (
  props: React.SVGProps<SVGSVGElement>
) => React.ReactNode;

/**
 * The mark drawn in the field for each recognised brand, from
 * `react-payment-logos` (MIT). Every brand in `CARD_BRANDS` has one, so the
 * field never resolves a brand it cannot show.
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
