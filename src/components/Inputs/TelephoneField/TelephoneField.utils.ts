import {
  TELEPHONE_COUNTRIES,
  type TelephoneCountryDefinition,
} from "./TelephoneField.countries";

/** Display styles applied to the national part of a telephone number. */
export type TelephoneFormat = "parentheses" | "spaces" | "dashes" | "digits";

export interface ParsedTelephoneValue {
  /** Resolved country, or null while an international calling code is ambiguous. */
  country: TelephoneCountryDefinition | null;
  /** International calling code without a plus sign, or empty when unknown. */
  callingCode: string;
  /** National significant digits, excluding a recognized calling code. */
  digits: string;
}

/** Removes punctuation, whitespace, letters, and non-ASCII numeral characters. */
export const getTelephoneDigits = (value: string): string =>
  value.replace(/\D/g, "");

/** Finds a country without changing or guessing the supplied country code. */
export const getTelephoneCountry = (
  country?: string
): TelephoneCountryDefinition | null =>
  TELEPHONE_COUNTRIES.find(
    (entry) => entry.country === country?.toUpperCase()
  ) ?? null;

/** Filters the selector choices in dataset order; exclusions take precedence. */
export const getTelephoneCountries = (
  onlyCountries?: readonly string[],
  excludeCountries?: readonly string[]
): readonly TelephoneCountryDefinition[] => {
  const included = onlyCountries?.map((country) => country.toUpperCase());
  const excluded = excludeCountries?.map((country) => country.toUpperCase());

  return TELEPHONE_COUNTRIES.filter(
    ({ country }) =>
      (!included || included.includes(country)) && !excluded?.includes(country)
  );
};

/**
 * Parses an explicit international prefix against every supported country.
 * Shared calling codes need a matching preferred country; they never select an
 * arbitrary country. National input preserves significant and trunk zeroes.
 */
export const parseTelephoneValue = (
  value: string,
  preferredCountry?: string
): ParsedTelephoneValue => {
  const digits = getTelephoneDigits(value);

  if (!value.trimStart().startsWith("+")) {
    const country = getTelephoneCountry(preferredCountry ?? "US");

    return { country, callingCode: country?.callingCode ?? "", digits };
  }

  let callingCode = "";

  for (const country of TELEPHONE_COUNTRIES) {
    if (
      country.callingCode.length > callingCode.length &&
      digits.startsWith(country.callingCode)
    ) {
      callingCode = country.callingCode;
    }
  }

  const candidates = TELEPHONE_COUNTRIES.filter(
    (country) => country.callingCode === callingCode
  );
  const preferred = getTelephoneCountry(preferredCountry);
  const country =
    preferredCountry !== undefined
      ? preferred?.callingCode === callingCode
        ? preferred
        : null
      : candidates.length === 1
        ? candidates[0]
        : null;

  return {
    country,
    callingCode,
    digits: digits.slice(callingCode.length),
  };
};

/** Generic grouping is a display fallback, not country-specific validation. */
const getTelephoneGroups = (country: string, digitCount: number): number[] => {
  const commonGroups: Record<string, number[]> = {
    US: [3, 3, 4],
    CA: [3, 3, 4],
    GB: [4, 3, 3],
    FR: [1, 2, 2, 2, 2],
    AU: [3, 3, 3],
    IN: [5, 5],
    BR: digitCount > 10 ? [2, 5, 4] : [2, 4, 4],
    MX: [2, 4, 4],
    JP: [2, 4, 4],
  };

  if (commonGroups[country]) {
    return commonGroups[country];
  }

  const groups: number[] = [];
  let remaining = digitCount;

  while (remaining > 0) {
    const length = remaining > 4 ? 3 : remaining;
    groups.push(length);
    remaining -= length;
  }

  return groups;
};

/** Mask slots consume digits; trailing literals wait until another digit exists. */
const applyTelephoneMask = (digits: string, mask: string): string => {
  let formatted = "";
  let digitIndex = 0;

  for (const character of mask) {
    if (digitIndex === digits.length) {
      break;
    }

    if (character === "#") {
      formatted += digits[digitIndex];
      digitIndex += 1;
    } else {
      formatted += character;
    }
  }

  return formatted + digits.slice(digitIndex);
};

/**
 * Formats national digits without truncating them. A custom # mask overrides the
 * preset. Parentheses wrap the first group; US/CA add a space after that group.
 */
export const formatTelephoneDigits = (
  value: string,
  country?: string,
  format: TelephoneFormat = "parentheses",
  mask?: string
): string => {
  const digits = getTelephoneDigits(value);

  if (!digits) {
    return "";
  }

  if (mask !== undefined) {
    return applyTelephoneMask(digits, mask);
  }

  if (format === "digits") {
    return digits;
  }

  const countryCode = country?.toUpperCase() ?? "US";
  const lengths = getTelephoneGroups(countryCode, digits.length);
  const groups: string[] = [];
  let offset = 0;

  for (const length of lengths) {
    if (offset >= digits.length) {
      break;
    }

    groups.push(digits.slice(offset, offset + length));
    offset += length;
  }

  if (offset < digits.length) {
    groups.push(digits.slice(offset));
  }

  if (format === "spaces" || format === "dashes") {
    return groups.join(format === "spaces" ? " " : "-");
  }

  const firstGroup = `(${groups[0]}${groups[0].length === lengths[0] ? ")" : ""}`;

  if (groups.length === 1) {
    return firstGroup;
  }

  const gap = countryCode === "US" || countryCode === "CA" ? " " : "";
  return firstGroup + gap + groups.slice(1).join("-");
};

/** Applies the country digit limit without counting mask punctuation. */
export const limitTelephoneDigits = (
  value: string,
  callingCode: string,
  country?: string
): string => {
  const maxLength = Math.min(
    getTelephoneCountry(country)?.maxLength ?? 15,
    Math.max(0, 15 - getTelephoneDigits(callingCode).length)
  );

  return getTelephoneDigits(value).slice(0, maxLength);
};

/** Keeps unknown explicit international prefixes visible until they resolve. */
export const formatTelephoneValue = (
  callingCode: string,
  nationalValue: string
): string =>
  nationalValue
    ? `+${callingCode}${callingCode ? " " : ""}${nationalValue}`
    : "";

/** Finds the caret immediately after the requested count of formatted digits. */
export const getTelephoneCaretPosition = (
  formatted: string,
  digitCount: number
): number => {
  if (digitCount <= 0) {
    return 0;
  }

  let count = 0;

  for (let index = 0; index < formatted.length; index += 1) {
    if (/\d/.test(formatted[index])) {
      count += 1;

      if (count === digitCount) {
        return index + 1;
      }
    }
  }

  return formatted.length;
};
