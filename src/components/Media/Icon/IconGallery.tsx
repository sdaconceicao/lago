import * as lucide from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { SearchField } from "@/components/Inputs/Search/SearchField/SearchField";
import { useClipboard } from "@/hooks/use-clipboard";
import { useRevealOnScroll } from "./IconGallery.hooks";
import styles from "./IconGallery.module.css";
import {
  buildIconEntries,
  filterIcons,
  type IconEntry,
  toIconTitle,
  toImportStatement,
} from "./IconGallery.utils";

/**
 * Every icon lucide ships, built once — the set never changes at runtime.
 *
 * Reading the whole namespace is what puts the renamed names in reach of the
 * search, and is also why this belongs to the story rather than the library: it
 * defeats tree shaking, so an app should keep importing icons by name.
 */
const ICON_ENTRIES = buildIconEntries(lucide.icons, lucide);

/** Icons added per reveal — a screenful and a half, cheap enough to mount at once. */
const CHUNK_SIZE = 200;

/** Preview size, matching the 24px lucide draws at by default. */
const PREVIEW_SIZE = 24;

interface IconCardProps {
  /** The icon this card previews. */
  entry: IconEntry;
  /** Whether this card's import line is the one currently on the clipboard. */
  isCopied: boolean;
  /** Called with the icon's name when the card is pressed. */
  onCopy: (name: string) => void;
}

/**
 * One icon in the grid. Memoised so copying — which re-renders the gallery —
 * only re-renders the card that changed, not the hundreds around it.
 */
const IconCard = memo(({ entry, isCopied, onCopy }: IconCardProps) => {
  const { Component, name } = entry;

  return (
    <button
      type="button"
      className={styles.card}
      title={toIconTitle(entry)}
      onClick={() => onCopy(name)}
    >
      <Component size={PREVIEW_SIZE} aria-hidden="true" />
      <span className={styles.cardName}>{isCopied ? "Copied!" : name}</span>
    </button>
  );
});

IconCard.displayName = "IconCard";

/**
 * Searchable catalogue of every lucide icon. Pressing a card copies that icon's
 * import line. Story-only: it is not part of Lago's public API.
 */
export const IconGallery = () => {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
  const { copied, copy } = useClipboard();

  const matches = useMemo(() => filterIcons(ICON_ENTRIES, query), [query]);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    // A new query starts the list over, so the first screenful is the top of
    // the new results rather than however far the last one had been scrolled.
    setVisibleCount(CHUNK_SIZE);
  }, []);

  const revealMore = useCallback(
    () => setVisibleCount((count) => count + CHUNK_SIZE),
    []
  );

  const handleCopy = useCallback(
    (name: string) => {
      copy(toImportStatement(name), name);
    },
    [copy]
  );

  const hasMore = visibleCount < matches.length;
  const sentinelRef = useRevealOnScroll(revealMore, hasMore);

  return (
    <div className={styles.gallery}>
      <div className={styles.header}>
        <SearchField
          className={styles.search}
          label="Search icons"
          placeholder="arrow, circle alert, AlertCircle…"
          description="Matches the icon's name, its hyphenated lucide.dev name, and any name it was renamed from."
          onChange={handleSearch}
        />
        <p className={styles.count} aria-live="polite">
          {query.trim() === ""
            ? `${ICON_ENTRIES.length.toLocaleString()} icons`
            : `${matches.length.toLocaleString()} of ${ICON_ENTRIES.length.toLocaleString()} icons`}{" "}
          · press an icon to copy its import
        </p>
      </div>
      {matches.length === 0 ? (
        <p className={styles.empty}>
          No icon matches “{query.trim()}”. Every term has to appear in the
          name, so try fewer of them.
        </p>
      ) : (
        <>
          <div className={styles.grid}>
            {matches.slice(0, visibleCount).map((entry) => (
              <IconCard
                key={entry.name}
                entry={entry}
                isCopied={copied === entry.name}
                onCopy={handleCopy}
              />
            ))}
          </div>
          {hasMore && (
            <div
              ref={sentinelRef}
              className={styles.sentinel}
              aria-hidden="true"
            />
          )}
        </>
      )}
    </div>
  );
};
