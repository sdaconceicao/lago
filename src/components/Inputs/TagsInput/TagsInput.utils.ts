import type { Key } from "react-aria-components/ComboBox";

/**
 * An option offered in the TagsInput's dropdown, and the shape of a tag the user
 * adds. The same objects are used for the chips below the field, so `label` is
 * the single source of truth for a tag's text.
 */
export interface TagsInputItem {
  /** Stable unique key. This is what `value` and `onChange` report. */
  id: Key;
  /** Text shown in the dropdown row and on the tag chip. */
  label: string;
}

/**
 * Key of the synthetic "add what you typed" row. It is a collection item like
 * any other so it can be hovered, arrowed to, and pressed, but it never reaches
 * `onChange`: the change handler swaps it for the created item's own key.
 */
export const CREATE_KEY = "__tagsInputCreate__";

/** Whether two labels name the same tag, ignoring case and surrounding whitespace. */
export const isSameLabel = (a: string, b: string): boolean =>
  a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();

/** The item whose label matches `label`, or undefined when the label is new. */
export const findItemByLabel = (
  items: TagsInputItem[],
  label: string
): TagsInputItem | undefined =>
  items.find((item) => isSameLabel(item.label, label));

/**
 * The create row's text, used both as its accessible name and as its visible
 * label so the two match.
 *
 * The query is embedded verbatim rather than trimmed because React Aria filters
 * the collection with a "contains" test against the raw input value: a trimmed
 * query would drop the row the moment the user typed a trailing space. Since
 * the text always contains the query, the row always survives the filter.
 */
export const getCreateLabel = (query: string): string => `Add “${query}”`;

/**
 * The dropdown collection: every option the TagsInput knows about, plus the
 * create row when the query names a tag that does not exist yet. Ordering puts
 * the create row last so real matches stay at the top of the list.
 */
export const getCollectionItems = ({
  items,
  query,
  allowsCreate,
}: {
  items: TagsInputItem[];
  query: string;
  allowsCreate: boolean;
}): TagsInputItem[] => {
  const canCreate =
    allowsCreate && query.trim() !== "" && !findItemByLabel(items, query);

  return canCreate
    ? [...items, { id: CREATE_KEY, label: query }]
    : // A new array either way, so the collection identity only changes when
      // its contents do.
      [...items];
};

/**
 * The options a TagsInput knows about: the ones it was given plus the ones the
 * user created, keyed uniquely.
 *
 * Created items are kept even after their tag is removed so the label stays
 * resolvable and the tag can be picked again from the list. A caller that
 * persists `onCreate` items into its own `items` would otherwise hand back a
 * duplicate key, which React Aria's collection cannot hold, so `items` wins on
 * a collision.
 */
export const mergeItems = (
  items: TagsInputItem[],
  createdItems: TagsInputItem[]
): TagsInputItem[] => {
  const keys = new Set(items.map((item) => item.id));
  return [...items, ...createdItems.filter((item) => !keys.has(item.id))];
};

/** Whether two key lists hold the same keys in the same order. */
export const isSameKeys = (a: readonly Key[], b: readonly Key[]): boolean =>
  a.length === b.length && a.every((key, index) => key === b[index]);

/** `keys` with `key` appended, or unchanged when it is already selected. */
export const addKey = (keys: readonly Key[], key: Key): Key[] =>
  keys.includes(key) ? [...keys] : [...keys, key];

/**
 * `keys` with the synthetic create key replaced by `key`, de-duplicated in case
 * the created label resolved to an option that was already selected.
 */
export const replaceCreateKey = (keys: readonly Key[], key: Key): Key[] => [
  ...new Set(keys.map((current) => (current === CREATE_KEY ? key : current))),
];
