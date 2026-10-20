"use client";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { EllipsisVertical } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/Actions/Button/Button";
import { IconButton } from "@/components/Actions/IconButton/IconButton";
import { Toolbar } from "@/components/Actions/Toolbar/Toolbar";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
import { TextField } from "@/components/Inputs/TextField/TextField";
import { IconToggleButton } from "@/components/Inputs/Toggle/IconToggleButton/IconToggleButton";
import { Separator } from "@/components/Layout/Separator/Separator";
import { Dialog, DialogTrigger } from "@/components/Overlays/Dialog/Dialog";
import { Popover } from "@/components/Overlays/Popover/Popover";
import type {
  RichTextEditorTool,
  RichTextEditorToolbar as RichTextEditorToolbarLayout,
} from "../RichTextEditor.types";
import { useToolbarOverflow } from "./RichTextEditorToolbar.hooks";
import styles from "./RichTextEditorToolbar.module.css";
import { TOOL_REGISTRY } from "./toolRegistry";

/** One tool and the two states read off the document for it. */
interface ToolState {
  tool: RichTextEditorTool;
  isActive: boolean;
  isEnabled: boolean;
}

export interface RichTextEditorToolbarProps {
  /** The live editor the tools act on. */
  editor: Editor;
  /** Groups of tools, already normalized, in render order. */
  toolbar: RichTextEditorToolbarLayout;
  /** Matches the button height to the field size. */
  size: FieldSize;
  /** Disables every tool without disabling the editor separately. */
  isDisabled?: boolean;
}

/**
 * The formatting toolbar: lago's `Toolbar` and round `IconToggleButton`s,
 * driven by the tool registry.
 *
 * Every button is an independent toggle whose pressed state is read from the
 * document rather than held here, so the toolbar cannot drift out of step with
 * the content — clicking a button, typing a markdown shortcut, and moving the
 * caret into bold text all reach the button the same way.
 */
export function RichTextEditorToolbar({
  editor,
  toolbar,
  size,
  isDisabled,
}: RichTextEditorToolbarProps) {
  // tiptap does not re-render React on every transaction by default, so the
  // pressed and disabled states are read out of the editor explicitly.
  // useEditorState compares the selector's result, so the toolbar re-renders
  // when a flag actually flips rather than on every keystroke. The group shape
  // is preserved so the render below reads states straight out of it.
  const groups = useEditorState({
    editor,
    selector: ({ editor: current }): ToolState[][] =>
      toolbar.map((group) =>
        group.map((tool) => {
          const definition = TOOL_REGISTRY[tool];
          return {
            tool,
            isActive: definition.isActive(current),
            isEnabled: definition.isEnabled(current),
          };
        })
      ),
  });

  const linkAnchorRef = useRef<HTMLDivElement>(null);
  const moreAnchorRef = useRef<HTMLDivElement>(null);
  const { containerRef, visibleCount } = useToolbarOverflow(toolbar);
  const hasOverflow = visibleCount < groups.length;
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [isLinkFromOverflow, setIsLinkFromOverflow] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [href, setHref] = useState("");

  const handlePress = useCallback(
    (tool: RichTextEditorTool, inOverflow: boolean) => {
      setIsOverflowOpen(false);
      // Every tool but one is a command. A link needs a URL, so pressing the
      // button when there is no link to remove opens the Popover instead.
      if (tool === "link" && !editor.isActive("link")) {
        setIsLinkFromOverflow(inOverflow);
        setHref(editor.getAttributes("link").href ?? "");
        setIsLinkOpen(true);
        return;
      }
      TOOL_REGISTRY[tool].run(editor);
    },
    [editor]
  );

  const applyLink = useCallback(() => {
    const trimmed = href.trim();
    setIsLinkOpen(false);
    if (!trimmed) return;

    const chain = editor.chain().focus().extendMarkRange("link");

    // With no text selected there is nothing to turn into a link, and marking
    // an empty range would leave the press looking like it did nothing.
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

  const renderGroup = (
    group: ToolState[],
    index: number,
    inOverflow = false
  ) => {
    const overflowed = !inOverflow && index >= visibleCount;
    return (
      <div
        key={index}
        className={styles.section}
        data-toolbar-section={inOverflow ? undefined : ""}
        data-overflowed={overflowed || undefined}
        aria-hidden={overflowed || undefined}
        inert={overflowed}
      >
        {index > 0 && <Separator />}
        <div
          className={styles.group}
          ref={
            !inOverflow && group.some(({ tool }) => tool === "link")
              ? linkAnchorRef
              : undefined
          }
        >
          {group.map(({ tool, isActive, isEnabled }) => {
            const { label, icon: Icon } = TOOL_REGISTRY[tool];
            return (
              <IconToggleButton
                key={tool}
                aria-label={label}
                variant="quiet"
                size={size}
                isSelected={isActive}
                isDisabled={isDisabled || !isEnabled}
                onChange={() => handlePress(tool, inOverflow)}
              >
                <Icon aria-hidden="true" />
              </IconToggleButton>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div ref={containerRef} className={styles.container}>
        <Toolbar aria-label="Formatting" className={styles.toolbar}>
          {groups.map((group, index) => renderGroup(group, index))}
          <div
            className={styles.measurement}
            data-toolbar-more-measure=""
            aria-hidden="true"
            inert
          >
            <IconButton
              aria-label="More formatting"
              variant="quiet"
              size={size}
            >
              <EllipsisVertical aria-hidden="true" />
            </IconButton>
          </div>
          {hasOverflow && (
            <div ref={moreAnchorRef} className={styles.group}>
              <DialogTrigger
                isOpen={isOverflowOpen}
                onOpenChange={setIsOverflowOpen}
              >
                <IconButton
                  aria-label="More formatting"
                  variant="quiet"
                  size={size}
                  isDisabled={isDisabled}
                >
                  <EllipsisVertical aria-hidden="true" />
                </IconButton>
                <Popover
                  hideArrow
                  placement="bottom end"
                  className={styles.overflowPopover}
                >
                  <Dialog
                    aria-label="More formatting"
                    className={styles.overflowDialog}
                  >
                    <Toolbar
                      aria-label="Additional formatting"
                      className={styles.overflowToolbar}
                    >
                      {groups
                        .slice(visibleCount)
                        .map((group, index) => renderGroup(group, index, true))}
                    </Toolbar>
                  </Dialog>
                </Popover>
              </DialogTrigger>
            </div>
          )}
        </Toolbar>
      </div>

      <Popover
        triggerRef={
          isLinkFromOverflow && hasOverflow ? moreAnchorRef : linkAnchorRef
        }
        isOpen={isLinkOpen}
        onOpenChange={setIsLinkOpen}
        placement="bottom start"
      >
        <Dialog aria-label="Add link">
          <form
            className={styles.linkForm}
            onSubmit={(event) => {
              event.preventDefault();
              applyLink();
            }}
          >
            <TextField
              autoFocus
              label="URL"
              size={size}
              type="url"
              placeholder="https://example.com"
              value={href}
              onChange={setHref}
            />
            <Button size={size} type="submit">
              Add link
            </Button>
          </form>
        </Dialog>
      </Popover>
    </>
  );
}
