"use client";
import type { Editor } from "@tiptap/core";
import { EllipsisVertical } from "lucide-react";
import { IconButton } from "@/components/Actions/IconButton/IconButton";
import { Toolbar } from "@/components/Actions/Toolbar/Toolbar";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
import type { RichTextEditorToolbar as RichTextEditorToolbarLayout } from "../RichTextEditor.types";
import { RichTextEditorLinkPopover } from "./RichTextEditorLinkPopover";
import {
  useToolbarActions,
  useToolbarOverflow,
  useToolbarTools,
} from "./RichTextEditorToolbar.hooks";
import styles from "./RichTextEditorToolbar.module.css";
import { RichTextEditorToolbarOverflow } from "./RichTextEditorToolbarOverflow";
import { RichTextEditorToolbarSection } from "./RichTextEditorToolbarSection";

export interface RichTextEditorToolbarProps {
  /** The live editor the tools act on. */
  editor: Editor;
  /** Groups of tools, already normalized, in render order. */
  toolbar: RichTextEditorToolbarLayout;
  /** Field size; large editors use medium toolbar controls. */
  size: FieldSize;
  /** Disables every tool without disabling the editor separately. */
  isDisabled?: boolean;
}

/** Connects editor interactions to the primary bar and its two popovers. */
export function RichTextEditorToolbar({
  editor,
  toolbar,
  size: fieldSize,
  isDisabled,
}: RichTextEditorToolbarProps) {
  const size = fieldSize === "lg" ? "md" : fieldSize;
  const groups = useToolbarTools(editor, toolbar);
  const { containerRef, visibleCount } = useToolbarOverflow(toolbar);
  const hasOverflow = visibleCount < groups.length;
  const { linkAnchorRef, handlePress, closeOverflow, overflow, link } =
    useToolbarActions(editor, hasOverflow);
  const sectionProps = {
    editor,
    size,
    isDisabled,
    onPress: handlePress,
    onHeadingChange: closeOverflow,
  };

  return (
    <>
      <div
        ref={containerRef}
        className={styles.container}
        data-field-size={size}
      >
        <Toolbar aria-label="Formatting" className={styles.toolbar}>
          {groups.map((group, index) => (
            <RichTextEditorToolbarSection
              {...sectionProps}
              // biome-ignore lint/suspicious/noArrayIndexKey: Layouts may contain identical groups; preserve each positional section.
              key={index}
              group={group}
              index={index}
              isOverflowed={index >= visibleCount}
              linkAnchorRef={linkAnchorRef}
            />
          ))}
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
            <RichTextEditorToolbarOverflow
              {...overflow}
              size={size}
              isDisabled={isDisabled}
            >
              {groups.slice(visibleCount).map((group, index) => (
                <RichTextEditorToolbarSection
                  {...sectionProps}
                  // biome-ignore lint/suspicious/noArrayIndexKey: Layouts may contain identical groups; preserve each positional section.
                  key={index}
                  group={group}
                  index={index}
                  inOverflow
                />
              ))}
            </RichTextEditorToolbarOverflow>
          )}
        </Toolbar>
      </div>
      <RichTextEditorLinkPopover
        {...link}
        size={size}
        isDisabled={isDisabled}
      />
    </>
  );
}
