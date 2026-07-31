/**
 * Card brand detection and input masking, derived from the issuer identification
 * numbers (IINs) that open every card number. No third-party lookup is involved:
 * the prefixes, valid lengths, and digit grouping of each brand are declared in
 * `CARD_BRANDS` below and everything else is computed from that table.
 */

/** A card brand CreditCardNumber recognises from the digits entered so far. */
export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "jcb"
  | "unionpay"
  | "maestro";

/**
 * An IIN prefix: either a literal such as `4`, or an inclusive range such as
 * `[51, 55]`. Both bounds of a range must have the same number of digits.
 */
export type CardBrandPattern = number | [number, number];

/** Everything the field needs to know about one brand. */
export interface CardBrandDefinition {
  /** Stable identifier reported by `onBrandChange`. */
  brand: CardBrand;
  /** Full brand name, announced to screen readers once the brand is known. */
  label: string;
  /** IIN prefixes that identify the brand. */
  patterns: CardBrandPattern[];
  /** Every valid digit count for the brand, ascending. */
  lengths: number[];
  /** Digit offsets a space is inserted at — `[4, 8, 12, 16]` renders 4-4-4-4-3. */
  gaps: number[];
}

/** Grouping used until a brand is known, and by every brand that groups in fours. */
const DEFAULT_GAPS = [4, 8, 12, 16];

/** Grouping for the 4-6-5 and 4-6-4 brands (American Express, Diners Club). */
const SPLIT_GAPS = [4, 10];

/** Longest card number the ISO/IEC 7812 numbering scheme allows. */
export const MAX_CARD_DIGITS = 19;

/** Shortest card number in circulation, used to bound an unrecognised brand. */
export const MIN_CARD_DIGITS = 12;

/**
 * The recognised brands. Ordering carries no meaning — a number is matched
 * against every entry and the longest matching prefix wins — so brands are
 * listed roughly by how often they turn up.
 *
 * The Discover ranges deliberately omit 622126-622925, which Discover and
 * UnionPay co-issue: matching it would report one brand for cards belonging to
 * the other, so it is left to UnionPay's `62` prefix.
 */
export const CARD_BRANDS: CardBrandDefinition[] = [
  {
    brand: "visa",
    label: "Visa",
    patterns: [4],
    lengths: [13, 16, 19],
    gaps: DEFAULT_GAPS,
  },
  {
    brand: "mastercard",
    label: "Mastercard",
    patterns: [
      [51, 55],
      [2221, 2720],
    ],
    lengths: [16],
    gaps: DEFAULT_GAPS,
  },
  {
    brand: "amex",
    label: "American Express",
    patterns: [34, 37],
    lengths: [15],
    gaps: SPLIT_GAPS,
  },
  {
    brand: "discover",
    label: "Discover",
    patterns: [6011, [644, 649], 65],
    lengths: [16, 19],
    gaps: DEFAULT_GAPS,
  },
  {
    brand: "diners",
    label: "Diners Club",
    patterns: [[300, 305], 3095, 36, [38, 39]],
    lengths: [14, 16, 19],
    gaps: SPLIT_GAPS,
  },
  {
    brand: "jcb",
    label: "JCB",
    patterns: [[3528, 3589]],
    lengths: [16, 17, 18, 19],
    gaps: DEFAULT_GAPS,
  },
  {
    brand: "unionpay",
    label: "UnionPay",
    patterns: [62, 81],
    lengths: [14, 15, 16, 17, 18, 19],
    gaps: DEFAULT_GAPS,
  },
  {
    brand: "maestro",
    label: "Maestro",
    patterns: [5018, 5020, 5038, 5893, 6304, 6759, 6761, 6762, 6763],
    lengths: [12, 13, 14, 15, 16, 17, 18, 19],
    gaps: DEFAULT_GAPS,
  },
];

/** Strips every non-digit, turning a masked value back into raw card digits. */
export const getCardDigits = (value: string): string =>
  value.replace(/\D/g, "");

/**
 * How many digits of `digits` a pattern matches, or 0 when it cannot match.
 *
 * A partial number counts: "42" matches Visa's `4` for one digit, and matches
 * Mastercard's `[2221, 2720]` for no digits at all. Ranges are compared against
 * the same number of leading digits on both bounds, so "23" is still a possible
 * Mastercard while "2721" is not.
 */
const getPatternMatchLength = (
  digits: string,
  pattern: CardBrandPattern
): number => {
  if (digits === "") {
    return 0;
  }

  if (typeof pattern === "number") {
    const prefix = String(pattern);
    const length = Math.min(prefix.length, digits.length);
    return digits.slice(0, length) === prefix.slice(0, length) ? length : 0;
  }

  const [min, max] = pattern;
  const length = Math.min(String(min).length, digits.length);
  const value = Number(digits.slice(0, length));
  const lowerBound = Number(String(min).slice(0, length));
  const upperBound = Number(String(max).slice(0, length));

  return value >= lowerBound && value <= upperBound ? length : 0;
};

/** The longest prefix any of a brand's patterns matches. */
const getBrandMatchLength = (
  digits: string,
  definition: CardBrandDefinition
): number =>
  definition.patterns.reduce(
    (longest, pattern) =>
      Math.max(longest, getPatternMatchLength(digits, pattern)),
    0
  );

/**
 * Every brand the value could still belong to, keeping only those matched on the
 * longest prefix. A single candidate means the brand is settled; several mean
 * the number is still too short to tell them apart — "6" could open a Discover,
 * UnionPay, or Maestro number — and none means no known brand claims it.
 */
export const getCardBrandCandidates = (
  value: string
): CardBrandDefinition[] => {
  const digits = getCardDigits(value);
  const matches = CARD_BRANDS.map((definition) => ({
    definition,
    length: getBrandMatchLength(digits, definition),
  })).filter((match) => match.length > 0);

  const longest = matches.reduce(
    (longestSoFar, match) => Math.max(longestSoFar, match.length),
    0
  );

  return matches
    .filter((match) => match.length === longest)
    .map((match) => match.definition);
};

/** The brand's full definition, or null while the value is empty or ambiguous. */
export const getCardBrandDefinition = (
  value: string
): CardBrandDefinition | null => {
  const candidates = getCardBrandCandidates(value);
  return candidates.length === 1 ? candidates[0] : null;
};

/** The detected brand, or null while the value is empty or ambiguous. */
export const getCardBrand = (value: string): CardBrand | null =>
  getCardBrandDefinition(value)?.brand ?? null;

/** The most digits the brand accepts, falling back to the 19-digit ISO maximum. */
export const getCardMaxDigits = (
  definition: CardBrandDefinition | null
): number =>
  definition
    ? definition.lengths[definition.lengths.length - 1]
    : MAX_CARD_DIGITS;

/**
 * Masks a value for display: non-digits are dropped, digits beyond the brand's
 * longest form are truncated, and single spaces are inserted at the brand's
 * grouping offsets — 4-6-5 for American Express, 4-6-4 for Diners Club, groups
 * of four for everything else and for a brand that is not yet known.
 */
export const formatCardNumber = (
  value: string,
  definition: CardBrandDefinition | null = getCardBrandDefinition(value)
): string => {
  const gaps = definition?.gaps ?? DEFAULT_GAPS;
  const digits = getCardDigits(value).slice(0, getCardMaxDigits(definition));

  return digits
    .split("")
    .map((digit, index) => (gaps.includes(index) ? ` ${digit}` : digit))
    .join("");
};

/**
 * Length of the longest masked value the brand can produce, spaces included.
 * The field passes it to the input as `maxLength` so an over-long paste is
 * trimmed by the browser before it reaches the mask.
 */
export const getMaskedMaxLength = (
  definition: CardBrandDefinition | null
): number =>
  formatCardNumber("0".repeat(getCardMaxDigits(definition)), definition).length;

/** Whether the value has a length the brand actually issues. */
export const isCompleteCardNumber = (
  value: string,
  definition: CardBrandDefinition | null = getCardBrandDefinition(value)
): boolean => {
  const { length } = getCardDigits(value);

  return definition
    ? definition.lengths.includes(length)
    : length >= MIN_CARD_DIGITS && length <= MAX_CARD_DIGITS;
};

/**
 * The Luhn checksum every card number satisfies: doubling every second digit
 * from the right, subtracting 9 from any result above 9, must total a multiple
 * of ten. It catches transposed and mistyped digits, not cards that were never
 * issued.
 */
export const passesLuhnCheck = (value: string): boolean => {
  const digits = getCardDigits(value);

  if (digits === "") {
    return false;
  }

  const total = digits
    .split("")
    .reverse()
    .reduce((sum, digit, index) => {
      const parsed = Number(digit);

      if (index % 2 === 0) {
        return sum + parsed;
      }

      const doubled = parsed * 2;
      return sum + (doubled > 9 ? doubled - 9 : doubled);
    }, 0);

  return total % 10 === 0;
};

/**
 * Whether the value is a plausible card number: a length its brand issues, and a
 * valid Luhn checksum. Pass it to a TextField `validate` handler, or call it on
 * submit — it says nothing about whether the card exists or has funds, which
 * only the payment processor can answer.
 */
export const isValidCardNumber = (value: string): boolean =>
  isCompleteCardNumber(value) && passesLuhnCheck(value);

/**
 * The caret offset in a masked value that sits just after `digitCount` digits.
 * Typing reformats the value under the caret, so the caret is re-anchored to the
 * digit it was next to rather than to a character offset that has since moved.
 */
export const getCaretPositionAfterDigits = (
  formatted: string,
  digitCount: number
): number => {
  if (digitCount <= 0) {
    return 0;
  }

  let seen = 0;

  for (let index = 0; index < formatted.length; index++) {
    if (formatted[index] !== " ") {
      seen += 1;

      if (seen === digitCount) {
        return index + 1;
      }
    }
  }

  return formatted.length;
};
