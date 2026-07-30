/**
 * Characters that separate the parts of a person's name, whether it was written
 * as one ("Ada Lovelace"), as an email local part ("ada.lovelace@…") or as a
 * username ("ada_lovelace"). An apostrophe is deliberately absent: "O'Brien" is
 * one name, not two.
 */
const PART_SEPARATORS = /[\s._-]+/;

/** A part is only worth an initial if it contains at least one letter. */
const LETTER = /\p{L}/u;

/** Letters and digits both read as initials; punctuation does not. */
const LEADING_CHARACTER = /[\p{L}\p{N}]/u;

/**
 * The hues an initials avatar can take, drawn from the theme's named colours so
 * they follow the tint scale in both light and dark mode.
 */
const INITIALS_COLORS = [
  "var(--red)",
  "var(--orange)",
  "var(--yellow)",
  "var(--turquoise)",
  "var(--cyan)",
  "var(--green)",
  "var(--blue)",
  "var(--indigo)",
  "var(--purple)",
  "var(--pink)",
] as const;

/**
 * Reduces an identifier to the portion that actually names the person: the
 * local part of an email address, or the whole string for a name or username.
 *
 * The `@` is only treated as a domain separator when something precedes it, so
 * an "@handle" keeps its full text.
 */
const getNameSource = (value: string): string => {
  const trimmed = value.trim();
  const domainAt = trimmed.lastIndexOf("@");

  return domainAt > 0 ? trimmed.slice(0, domainAt) : trimmed;
};

/** The first letter or digit of a part, uppercased. Empty if it has neither. */
const getLeadingCharacter = (part: string): string =>
  part.match(LEADING_CHARACTER)?.[0].toUpperCase() ?? "";

/**
 * Derives the initials shown by an initials avatar from a name, email address
 * or username.
 *
 * Two letters are only used when the string genuinely names two parts of a
 * person — "Ada Lovelace", "ada.lovelace@example.com", "ada_lovelace" — taken
 * from the first and last of them so middle names drop out. Anything that
 * reads as a single word, such as the username "alovelace" or a mononym, gets
 * a single letter rather than an arbitrary second one.
 *
 * @example
 * getInitials("Ada Lovelace"); // "AL"
 * getInitials("ada.lovelace@example.com"); // "AL"
 * getInitials("Augusta Ada King-Noel"); // "AN"
 * getInitials("alovelace"); // "A"
 */
export const getInitials = (value: string): string => {
  const source = getNameSource(value);
  const parts = source
    .split(PART_SEPARATORS)
    .filter((part) => LETTER.test(part));

  if (parts.length === 0) {
    // Nothing letter-like to work with — a numeric handle, say. The first
    // character still identifies it better than an empty circle would.
    return getLeadingCharacter(source);
  }

  if (parts.length === 1) {
    return getLeadingCharacter(parts[0]);
  }

  return (
    getLeadingCharacter(parts[0]) + getLeadingCharacter(parts[parts.length - 1])
  );
};

/**
 * Picks a stable hue for an initials avatar so the same person keeps the same
 * colour everywhere, and two people side by side rarely share one.
 *
 * Case and surrounding whitespace are ignored, so "Ada Lovelace" and
 * "ada lovelace" agree. Returns a `var()` reference to a theme colour, which
 * the component assigns to `--avatar-color`.
 */
export const getInitialsColor = (value: string): string => {
  let hash = 0;

  for (const character of value.trim().toLowerCase()) {
    // `| 0` keeps the running value in 32-bit range so long strings cannot
    // drift into float precision and make the result platform dependent.
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  }

  return INITIALS_COLORS[Math.abs(hash) % INITIALS_COLORS.length];
};
