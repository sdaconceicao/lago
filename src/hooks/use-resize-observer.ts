"use client";
import { useEffect, useRef } from "react";

/**
 * Reads the content-box size off a ResizeObserver entry.
 *
 * `contentBoxSize` is the modern, cheap path: the browser hands the numbers to
 * the callback, so reading them costs nothing and — unlike
 * `getBoundingClientRect()` — cannot force a synchronous reflow. `contentRect`
 * is the pre-2020 shape, kept as a fallback; it allocates, but only on engines
 * that never populate `contentBoxSize`.
 */
const getContentBoxSize = (entry: ResizeObserverEntry): ResizeObserverSize => {
  const [size] = entry.contentBoxSize;
  if (size) return size;
  return {
    inlineSize: entry.contentRect.width,
    blockSize: entry.contentRect.height,
  };
};

/**
 * Calls `callback` with the observed element's content-box size whenever that
 * size changes, and once on mount. Content box rather than border box because
 * callers are almost always asking "how much room is there for my children",
 * which is the box padding has already been subtracted from.
 *
 * `target` is the element itself rather than a ref, so that an element which
 * appears after mount is picked up: a ref's `.current` changing does not
 * re-run an effect, which would silently leave such an element unobserved.
 * Hold it in state, typically by way of a callback ref.
 *
 * Observation is skipped where `ResizeObserver` is undefined (SSR, older test
 * environments), so the hook is safe to call unconditionally. The callback is
 * held in a ref, so passing an inline arrow does not tear down and re-create
 * the observer on every render.
 *
 * Do not resize the observed element from inside `callback`: that feeds the
 * observer its own output and the browser reports a "ResizeObserver loop"
 * error. Observe an element whose size is set by its parent instead.
 *
 * @param {Element} target - The element to observe, or null for none.
 * @param {Function} callback - Receives the new content-box size.
 */
export const useResizeObserver = (
  target: Element | null,
  callback: (size: ResizeObserverSize) => void
): void => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!target || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (entry) callbackRef.current(getContentBoxSize(entry));
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, [target]);
};
