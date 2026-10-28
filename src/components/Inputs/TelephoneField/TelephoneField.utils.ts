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

  // Keep the first group stable while entering a country's national number.
  const maxLength = getTelephoneCountry(country)?.maxLength;
  const groups: number[] = maxLength ? [maxLength <= 4 ? maxLength : 3] : [];
  let remaining = digitCount - (groups[0] ?? 0);

  while (remaining > 0) {
    const length = remaining > 4 ? 3 : remaining;
    groups.push(length);
    remaining -= length;
  }

  return groups;
};

/** Numeric literals consume an existing matching digit in complete values. */
const applyTelephoneMask = (
  digits: string,
  mask: string,
  consumeLiterals = true
): string => {
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
      if (
        consumeLiterals &&
        /\d/.test(character) &&
        digits[digitIndex] === character
      )
        digitIndex += 1;
    }
  }

  return formatted + digits.slice(digitIndex);
};

/** Fixed mask digits behave like separators when navigating editable slots. */
export const isTelephoneDigitEditable = (
  value: string,
  position: number,
  mask?: string
): boolean =>
  /\d/.test(value[position] ?? "") &&
  (mask?.[position] === undefined || mask[position] === "#");

const getTelephoneSlotDigits = (
  value: string,
  mask: string,
  start = 0,
  end = value.length
): string => {
  let digits = "";
  for (let index = start; index < end; index += 1) {
    if (isTelephoneDigitEditable(value, index, mask)) digits += value[index];
  }
  return digits;
};

/** Reapplies fixed digits while preserving the editable digits around an edit. */
export const getTelephoneMaskEdit = (
  previous: string,
  next: string,
  mask: string,
  caret: number
): { digits: string; caretDigits: number } => {
  let previousEnd = previous.length;
  let nextEnd = next.length;
  while (
    nextEnd > caret &&
    previousEnd > 0 &&
    previous[previousEnd - 1] === next[nextEnd - 1]
  ) {
    previousEnd -= 1;
    nextEnd -= 1;
  }
  let start = 0;
  while (
    start < previousEnd &&
    start < nextEnd &&
    previous[start] === next[start]
  )
    start += 1;

  const before = getTelephoneSlotDigits(previous, mask, 0, start);
  const after = getTelephoneSlotDigits(previous, mask, previousEnd);
  const inserted = getTelephoneDigits(next.slice(start, nextEnd));
  // Whole-number pastes may already contain the mask's fixed digits.
  if (
    (start === 0 && previousEnd === previous.length) ||
    (!before && !after && inserted.length > 1)
  ) {
    const formatted = applyTelephoneMask(
      getTelephoneDigits(next.slice(start, nextEnd)),
      mask
    );
    const prefix = applyTelephoneMask(
      getTelephoneDigits(next.slice(start, caret)),
      mask
    );
    return {
      digits: getTelephoneDigits(formatted),
      caretDigits: getTelephoneSlotDigits(prefix, mask).length,
    };
  }

  if (start === previous.length) {
    const remainingMask = mask.slice(start);
    const suffix = applyTelephoneMask(inserted, remainingMask);
    const prefix = applyTelephoneMask(
      getTelephoneDigits(next.slice(start, caret)),
      remainingMask
    );
    return {
      digits: getTelephoneDigits(previous + suffix),
      caretDigits:
        before.length +
        getTelephoneSlotDigits(prefix, remainingMask).length +
        (prefix &&
        !isTelephoneDigitEditable(prefix, prefix.length - 1, remainingMask)
          ? 1
          : 0),
    };
  }

  return {
    digits: getTelephoneDigits(
      applyTelephoneMask(before + inserted + after, mask, false)
    ),
    caretDigits:
      before.length +
      getTelephoneDigits(next.slice(start, Math.min(caret, nextEnd))).length,
  };
};

/**
 * Formats national digits without truncating them. A custom # mask overrides the
 * preset; matching numeric literals are consumed once and missing ones inserted.
 * Parentheses wrap the first group, with a space before following digits.
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

  return `${firstGroup} ${groups.slice(1).join("-")}`;
};

/** Builds a zero-digit format hint without guessing an unresolved country. */
export const getTelephonePlaceholder = (
  country?: string,
  format: TelephoneFormat = "parentheses",
  mask?: string
): string | undefined => {
  const definition = getTelephoneCountry(country);
  if (!definition) return undefined;

  const length = Math.min(
    definition.maxLength,
    getTelephoneGroups(definition.country, definition.maxLength).reduce(
      (total, group) => total + group,
      0
    )
  );

  return formatTelephoneDigits(
    limitTelephoneDigits(
      "0".repeat(length),
      definition.callingCode,
      country,
      mask
    ),
    definition.country,
    format,
    mask
  );
};

/** Formats allowed countries; unresolved or excluded countries keep raw digits unless a custom mask is supplied. */
export const formatTelephoneInput = (
  parsed: ParsedTelephoneValue,
  countries: readonly TelephoneCountryDefinition[],
  format: TelephoneFormat = "parentheses",
  mask?: string
): string => {
  const country = countries.some(
    (entry) => entry.country === parsed.country?.country
  )
    ? parsed.country?.country
    : undefined;

  return country || mask !== undefined
    ? formatTelephoneDigits(parsed.digits, country, format, mask)
    : parsed.digits;
};

/** Applies the country digit limit, including fixed mask digits but not punctuation. */
export const limitTelephoneDigits = (
  value: string,
  callingCode: string,
  country?: string,
  mask?: string
): string => {
  const maxLength = Math.min(
    getTelephoneCountry(country)?.maxLength ?? 15,
    Math.max(0, 15 - getTelephoneDigits(callingCode).length)
  );

  const digits = getTelephoneDigits(value);
  return getTelephoneDigits(
    mask === undefined ? digits : applyTelephoneMask(digits, mask)
  ).slice(0, maxLength);
};

/** Keeps unknown explicit international prefixes visible until they resolve. */
export const formatTelephoneValue = (
  callingCode: string,
  nationalValue: string
): string =>
  nationalValue
    ? `+${callingCode}${callingCode ? " " : ""}${nationalValue}`
    : "";

/** Finds the caret after a digit count, skipping fixed literals when a mask is supplied. */
export const getTelephoneCaretPosition = (
  formatted: string,
  digitCount: number,
  mask?: string
): number => {
  if (digitCount <= 0) {
    return mask === undefined
      ? 0
      : Math.min(
          formatted.length,
          mask.includes("#") ? mask.indexOf("#") : mask.length
        );
  }

  let count = 0;

  for (let index = 0; index < formatted.length; index += 1) {
    if (isTelephoneDigitEditable(formatted, index, mask)) {
      count += 1;

      if (count === digitCount) {
        return index + 1;
      }
    }
  }

  return formatted.length;
};
