import { type RefObject, useEffect, useRef } from "react";

/** How far ahead of the scroll position the next chunk starts rendering. */
const REVEAL_MARGIN = "400px";

/**
 * Calls `onReveal` each time the sentinel comes within reach of the viewport,
 * which is how the grid grows a chunk at a time instead of mounting every icon
 * up front. The story scrolls the canvas itself, so the viewport is the root.
 *
 * `isEnabled` is false once the whole list is rendered, at which point the
 * caller stops rendering the sentinel; flipping it back on observes the new one.
 */
export const useRevealOnScroll = (
  onReveal: () => void,
  isEnabled: boolean
): RefObject<HTMLDivElement | null> => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!isEnabled || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onReveal();
      },
      { rootMargin: REVEAL_MARGIN }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [isEnabled, onReveal]);

  return sentinelRef;
};
