"use client";
import { useCallback, useState } from "react";

/**
 * Where an image has got to.
 *
 * - `empty` — no `src` was given, so nothing is loading and the placeholder is
 *   holding the space rather than reporting progress.
 * - `loading` — the browser is fetching the image.
 * - `loaded` — the image decoded and is on screen.
 * - `error` — the image could not be loaded.
 */
export type ImageStatus = "empty" | "loading" | "loaded" | "error";

/**
 * Tracks the load state of `src`, together with the handlers that move it on.
 *
 * The resolved state is stored against the URL that produced it, so a new `src`
 * reads as `loading` again the moment it is passed — no effect is needed to
 * clear the previous result, and a failed URL never poisons the next one.
 */
export const useImageStatus = (src?: string) => {
  const [resolved, setResolved] = useState<{
    src: string;
    status: "loaded" | "error";
  }>();

  const status: ImageStatus = !src
    ? "empty"
    : resolved?.src === src
      ? resolved.status
      : "loading";

  const settle = useCallback(
    (next: "loaded" | "error") => {
      // Only reachable with a src — the handlers below are attached to an
      // element that is only rendered once there is one — but recording a
      // result against no URL would be meaningless, so it is guarded.
      if (!src) return;

      // The same result recorded twice is not news, and the same URL can settle
      // more than once: a picture that has already loaded settles again from the
      // element that replaces the placeholder. Keeping the previous object spares
      // the render that a new one would cost.
      setResolved((previous) =>
        previous?.src === src && previous.status === next
          ? previous
          : { src, status: next }
      );
    },
    [src]
  );

  const markLoaded = useCallback(() => settle("loaded"), [settle]);

  const markError = useCallback(() => settle("error"), [settle]);

  /**
   * A cached image can finish — or fail — before hydration attaches `onLoad`
   * and `onError`, which would leave the placeholder up for good. The ref runs
   * on mount and whenever `src` changes, so the status is settled from the
   * element itself when the browser already resolved it.
   */
  const settleFromNode = useCallback(
    (node: unknown) => {
      if (!(node instanceof HTMLImageElement) || !node.complete) return;

      settle(node.naturalWidth > 0 ? "loaded" : "error");
    },
    [settle]
  );

  return { status, markLoaded, markError, settleFromNode };
};
