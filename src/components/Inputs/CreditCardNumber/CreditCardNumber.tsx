"use client";
import clsx from "clsx";
import { CreditCard } from "lucide-react";
import { VisuallyHidden } from "react-aria-components/VisuallyHidden";
import {
  TextField,
  type TextFieldProps,
} from "@/components/Inputs/TextField/TextField";
import { useCreditCardNumber } from "./CreditCardNumber.hooks";
import { CARD_BRAND_LOGOS } from "./CreditCardNumber.logos";
import styles from "./CreditCardNumber.module.css";
import type { CardBrand } from "./CreditCardNumber.utils";

export interface CreditCardNumberProps
  extends Omit<
    TextFieldProps,
    "type" | "button" | "children" | "maxLength" | "minLength"
  > {
  /**
   * Called when the brand detected from the digits changes — with the brand once
   * the number identifies one, and with null while the field is empty or the
   * digits so far fit more than one brand.
   */
  onBrandChange?: (brand: CardBrand | null) => void;
}

/**
 * A card number entry field. CreditCardNumber is a TextField that masks what the
 * user types — digits only, grouped as the brand groups them, capped at the
 * brand's longest form — and shows the mark of the brand it recognizes from the
 * leading digits, so it keeps the label, description, validation states, and
 * field sizing every other field has.
 */
export function CreditCardNumber({
  value,
  defaultValue,
  onChange,
  onBrandChange,
  onKeyDown,
  inputRef,
  autoComplete = "cc-number",
  inputMode = "numeric",
  autoCorrect = "off",
  spellCheck = "false",
  ...props
}: CreditCardNumberProps) {
  const card = useCreditCardNumber({
    value,
    defaultValue,
    onChange,
    onBrandChange,
    inputRef,
    onKeyDown,
  });
  const Logo = card.definition && CARD_BRAND_LOGOS[card.definition.brand];

  return (
    <TextField
      {...props}
      type="text"
      value={card.value}
      onChange={card.onChange}
      onKeyDown={card.onKeyDown}
      inputRef={card.inputRef}
      maxLength={card.maxLength}
      autoComplete={autoComplete}
      inputMode={inputMode}
      autoCorrect={autoCorrect}
      spellCheck={spellCheck}
      className={clsx(styles.creditCardNumber, props.className)}
      suffix={
        // Rendered in the trailing slot the reveal and clear buttons use, so the
        // field keeps its inset surface and metrics. The mark is decorative: the
        // brand reaches assistive technology through the status message beside
        // it, which is the only part that changes when a brand is recognised.
        <span className={styles.brand} data-brand={card.definition?.brand}>
          {Logo ? (
            <Logo
              aria-hidden="true"
              focusable="false"
              className={styles.brandLogo}
            />
          ) : (
            <CreditCard aria-hidden="true" className={styles.brandIcon} />
          )}
          <VisuallyHidden>
            <span role="status">
              {card.definition ? `${card.definition.label} card` : ""}
            </span>
          </VisuallyHidden>
        </span>
      }
    />
  );
}

export type { CardBrandLogo } from "./CreditCardNumber.logos";
export { CARD_BRAND_LOGOS } from "./CreditCardNumber.logos";
export type {
  CardBrand,
  CardBrandDefinition,
  CardBrandPattern,
} from "./CreditCardNumber.utils";
export {
  CARD_BRANDS,
  formatCardNumber,
  getCardBrand,
  getCardBrandCandidates,
  getCardBrandDefinition,
  getCardDigits,
  isCompleteCardNumber,
  isValidCardNumber,
  passesLuhnCheck,
} from "./CreditCardNumber.utils";
