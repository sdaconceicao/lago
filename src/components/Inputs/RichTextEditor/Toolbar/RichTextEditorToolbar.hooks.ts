"use client";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import type {
  RichTextEditorTool,
  RichTextEditorToolbar,
} from "../RichTextEditor.types";
import { getVisibleToolbarGroupCount } from "./RichTextEditorToolbar.utils";
import { TOOL_REGISTRY } from "./toolRegistry";

export type ToolbarButtonTool = Exclude<RichTextEditorTool, "heading">;
export type ToolbarToolState =
  | { tool: "heading" }
  | {
      tool: ToolbarButtonTool;
      isActive: boolean;
      isEnabled: boolean;
    };

/** Subscribes to tool flags, updating only when their selected/enabled state changes. */
export const useToolbarTools = (
  editor: Editor,
  toolbar: RichTextEditorToolbar
) =>
  useEditorState({
    editor,
    selector: ({ editor: current }): ToolbarToolState[][] =>
      toolbar.map((group) =>
        group.map((tool) => {
          if (tool === "heading") return { tool };
          const definition = TOOL_REGISTRY[tool];
          return {
            tool,
            isActive: definition.isActive(current),
            isEnabled: definition.isEnabled(current),
          };
        })
      ),
  });

/** Coordinates commands and popovers, including the link anchor after a resize. */
export const useToolbarActions = (editor: Editor, hasOverflow: boolean) => {
  const linkAnchorRef = useRef<HTMLDivElement>(null);
  const moreAnchorRef = useRef<HTMLDivElement>(null);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [isLinkFromOverflow, setIsLinkFromOverflow] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [href, setHref] = useState("");
  const closeOverflow = useCallback(() => setIsOverflowOpen(false), []);

  const handlePress = useCallback(
    (tool: ToolbarButtonTool, inOverflow: boolean) => {
      closeOverflow();
      // A new link needs a URL; an active link can be removed immediately.
      if (tool === "link" && !editor.isActive("link")) {
        setIsLinkFromOverflow(inOverflow);
        setHref(editor.getAttributes("link").href ?? "");
        setIsLinkOpen(true);
        return;
      }
      TOOL_REGISTRY[tool].run(editor);
    },
    [editor, closeOverflow]
  );

  const applyLink = useCallback(() => {
    const trimmed = href.trim();
    setIsLinkOpen(false);
    if (!trimmed) return;

    const chain = editor.chain().focus().extendMarkRange("link");

    // Without a selection, insert the URL as linked text instead of marking an empty range.
    if (editor.state.selection.empty) {
      chain
        .insertContent({
          type: "text",
          text: trimmed,
          marks: [{ type: "link", attrs: { href: trimmed } }],
        })
        .run();
      return;
    }

    chain.setLink({ href: trimmed }).run();
  }, [editor, href]);

  return {
    linkAnchorRef,
    handlePress,
    closeOverflow,
    overflow: {
      anchorRef: moreAnchorRef,
      isOpen: isOverflowOpen,
      onOpenChange: setIsOverflowOpen,
    },
    link: {
      triggerRef:
        isLinkFromOverflow && hasOverflow ? moreAnchorRef : linkAnchorRef,
      isOpen: isLinkOpen,
      onOpenChange: setIsLinkOpen,
      href,
      onHrefChange: setHref,
      onSubmit: applyLink,
    },
  };
};

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
