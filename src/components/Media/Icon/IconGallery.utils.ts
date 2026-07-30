import type { LucideIcon } from "lucide-react";

/** Affixes lucide re-exports every icon under, on top of its plain name. */
const ICON_SUFFIX = "Icon";
const LUCIDE_PREFIX = "Lucide";

/** One lucide icon, with everything the gallery searches and labels it by. */
export interface IconEntry {
  /** PascalCase export name — what you import from `lucide-react`. */
  name: string;
  /** Hyphenated name lucide uses for the icon's page on lucide.dev and for its dynamic-import map. */
  slug: string;
  /** Other names the same icon is exported under, from renames lucide keeps working. */
  aliases: string[];
  /** The icon component itself. */
  Component: LucideIcon;
  /** Lowercased text the search matches its terms against. */
  search: string;
}

/**
 * Converts an export name to the hyphenated name lucide itself uses:
 * `CircleAlert` → `circle-alert`, `AArrowDown` → `a-arrow-down`,
 * `Building2` → `building-2`.
 *
 * Digits break away from the letters around them, except for the `NxN` of the
 * grid names, which lucide keeps whole (`Grid2x2` → `grid-2x2`).
 */
export const toSlug = (name: string): string =>
  name
    // Acronym boundary, so the lone leading letter of `AArrowDown` breaks off.
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    // camelCase boundary.
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    // Letter followed by a digit, unless the letter is the `x` of an `NxN`.
    .replace(/(?<![\dx])(?<=[a-zA-Z])(?=\d)/g, "-")
    // Digit followed by a letter, unless the letter opens an `x<digit>`.
    .replace(/(?<=\d)(?=(?!x\d)[a-zA-Z])/g, "-")
    .toLowerCase();

/** Splits a query into the lowercase terms an entry has to match all of. */
export const toSearchTerms = (query: string): string[] =>
  query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/**
 * The text one entry is matched against: its name, its hyphenated name and its
 * aliases, followed by the same text with every separator squashed out — so
 * both `circle alert` and `circlealert` find `CircleAlert`.
 */
export const toSearchText = (
  name: string,
  slug: string,
  aliases: string[]
): string => {
  const words = [name, slug, ...aliases].join(" ").toLowerCase();

  return `${words} ${words.replace(/[^a-z0-9]/g, "")}`;
};

/**
 * Whether an export only repeats a name the gallery already lists. Every icon is
 * exported as its plain name, with an `Icon` suffix, and with a `Lucide` prefix
 * — and the same three ways again under each name it was renamed from. Only the
 * plain form of a rename is worth showing.
 */
const isDuplicateExport = (
  exportName: string,
  moduleExports: Readonly<Record<string, unknown>>
): boolean => {
  if (
    exportName.endsWith(ICON_SUFFIX) &&
    exportName.slice(0, -ICON_SUFFIX.length) in moduleExports
  ) {
    return true;
  }

  return (
    exportName.startsWith(LUCIDE_PREFIX) &&
    exportName.slice(LUCIDE_PREFIX.length) in moduleExports
  );
};

/** The line the gallery copies to the clipboard for an icon. */
export const toImportStatement = (name: string): string =>
  `import { ${name} } from "lucide-react";`;

/** Hover text for a card: the hyphenated name, plus any other names it answers to. */
export const toIconTitle = ({ slug, aliases }: IconEntry): string =>
  aliases.length === 0
    ? slug
    : `${slug} · also exported as ${aliases.join(", ")}`;

/**
 * Turns lucide's `icons` record into the gallery's list, folding in the alias
 * exports so a renamed icon is still findable under the name it used to have.
 *
 * `moduleExports` is the whole `lucide-react` namespace. An alias is the very
 * same component object as its canonical name, so identity is what links the
 * two — there is no naming rule to go by.
 */
export const buildIconEntries = (
  iconRecord: Readonly<Record<string, LucideIcon>>,
  moduleExports: Readonly<Record<string, unknown>>
): IconEntry[] => {
  const nameByComponent = new Map<unknown, string>(
    Object.entries(iconRecord).map(([name, Component]) => [Component, name])
  );

  const aliasesByName = new Map<string, string[]>();

  for (const [exportName, value] of Object.entries(moduleExports)) {
    const canonicalName = nameByComponent.get(value);

    // Not an icon, or the canonical export itself.
    if (!canonicalName || canonicalName === exportName) continue;

    if (isDuplicateExport(exportName, moduleExports)) continue;

    aliasesByName.set(canonicalName, [
      ...(aliasesByName.get(canonicalName) ?? []),
      exportName,
    ]);
  }

  return Object.entries(iconRecord)
    .map(([name, Component]) => {
      const slug = toSlug(name);
      const aliases = [...(aliasesByName.get(name) ?? [])].sort();

      return {
        name,
        slug,
        aliases,
        Component,
        search: toSearchText(name, slug, aliases),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

/** Every entry whose searchable text contains all of the query's terms. */
export const filterIcons = (
  entries: IconEntry[],
  query: string
): IconEntry[] => {
  const terms = toSearchTerms(query);

  if (terms.length === 0) return entries;

  return entries.filter((entry) =>
    terms.every((term) => entry.search.includes(term))
  );
};
