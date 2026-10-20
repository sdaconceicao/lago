"use client";
import { useCallback, useLayoutEffect, useState } from "react";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import type { RichTextEditorToolbar } from "../RichTextEditor.types";
import { getVisibleToolbarGroupCount } from "./RichTextEditorToolbar.utils";

/** Measures groups even while overflowed, so they can return when space grows. */
export const useToolbarOverflow = (toolbar: RichTextEditorToolbar) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState<number | null>(null);

  const measure = useCallback(() => {
    const bar = container?.querySelector<HTMLElement>('[role="toolbar"]');
    if (!bar) return;

    const style = getComputedStyle(bar);
    const availableWidth =
      bar.getBoundingClientRect().width -
      Number.parseFloat(style.paddingLeft) -
      Number.parseFloat(style.paddingRight);
    // No layout is available while hidden or in jsdom.
    if (availableWidth <= 0) return;

    const widths = Array.from(
      bar.querySelectorAll<HTMLElement>(":scope > [data-toolbar-section]"),
      (section) => section.getBoundingClientRect().width
    );
    const more = bar.querySelector<HTMLElement>("[data-toolbar-more-measure]");
    if (!more || widths.length !== toolbar.length) return;

    setVisibleCount(
      getVisibleToolbarGroupCount(
        widths,
        availableWidth,
        Number.parseFloat(style.columnGap) || 0,
        more.getBoundingClientRect().width
      )
    );
  }, [container, toolbar]);

  useLayoutEffect(measure, [measure]);
  useResizeObserver(container, measure);

  return {
    containerRef: setContainer,
    visibleCount: Math.min(visibleCount ?? toolbar.length, toolbar.length),
  };
};
