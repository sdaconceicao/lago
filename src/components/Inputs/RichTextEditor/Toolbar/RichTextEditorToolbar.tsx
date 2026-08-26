"use client";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { Fragment, useCallback, useRef, useState } from "react";
import { Button } from "@/components/Actions/Button/Button";
import { Toolbar } from "@/components/Actions/Toolbar/Toolbar";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
import { TextField } from "@/components/Inputs/TextField/TextField";
import { IconToggleButton } from "@/components/Inputs/Toggle/IconToggleButton/IconToggleButton";
import { ToggleButtonGroup } from "@/components/Inputs/Toggle/ToggleButtonGroup/ToggleButtonGroup";
import { Separator } from "@/components/Layout/Separator/Separator";
import { Dialog } from "@/components/Overlays/Dialog/Dialog";
import { Popover } from "@/components/Overlays/Popover/Popover";
import type {
  RichTextEditorTool,
  RichTextEditorToolbar as RichTextEditorToolbarLayout,
} from "../RichTextEditor.types";
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
 * The formatting toolbar: lago's `Toolbar`, `ToggleButtonGroup` and
 * `IconToggleButton`, driven by the tool registry.
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
  // pressed and disabled states are selected out of the editor explicitly.
  // useEditorState compares the result of this selector, so the toolbar
  // re-renders when a flag actually flips rather than on every keystroke — and
  // only for the tools on screen, since those are the only ones read here.
  //
  // The selector keeps the group shape so the render below reads its states
  // straight out of it, rather than looking each tool up in a second structure
  // that could be missing it.
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
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [href, setHref] = useState("");

  const handlePress = useCallback(
    (tool: RichTextEditorTool) => {
      // Every tool but one is a command. A link needs a URL, so pressing the
      // button when there is no link to remove opens the Popover instead.
      if (tool === "link" && !editor.isActive("link")) {
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
    // an empty range would leave the press looking like it did nothing at all.
    // Inserting the URL as its own linked text is what the caret position asks
    // for, and matches what a reader would expect to appear there.
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

  return (
    <>
      <Toolbar aria-label="Formatting" className={styles.toolbar}>
        {groups.map((group, index) => {
          const buttons = (
            <ToggleButtonGroup
              size={size}
              isDisabled={isDisabled}
              selectionMode="multiple"
            >
              {group.map(({ tool, isActive, isEnabled }) => {
                const { label, icon: Icon } = TOOL_REGISTRY[tool];
                return (
                  <IconToggleButton
                    key={tool}
                    aria-label={label}
                    variant="quiet"
                    isSelected={isActive}
                    isDisabled={isDisabled || !isEnabled}
                    onChange={() => handlePress(tool)}
                  >
                    <Icon aria-hidden="true" />
                  </IconToggleButton>
                );
              })}
            </ToggleButtonGroup>
          );

          return (
            // Groups are positional, so their index is the only stable identity
            // a consumer-supplied layout gives them. A Fragment rather than a
            // wrapper so the separators and groups stay direct children of the
            // Toolbar, which is what its flex and separator rules style.
            // biome-ignore lint/suspicious/noArrayIndexKey: see above
            <Fragment key={index}>
              {index > 0 && <Separator />}
              {group.some(({ tool }) => tool === "link") ? (
                // The popover anchors to a wrapper rather than the button
                // itself: lago's ToggleButton takes no ref, and an extra
                // element inside the group would break the segmented
                // first-child/last-child radii.
                <div className={styles.linkAnchor} ref={linkAnchorRef}>
                  {buttons}
                </div>
              ) : (
                buttons
              )}
            </Fragment>
          );
        })}
      </Toolbar>

      <Popover
        triggerRef={linkAnchorRef}
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
