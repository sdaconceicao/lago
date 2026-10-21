"use client";
import type { Editor } from "@tiptap/core";
import type { Ref } from "react";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
import { IconToggleButton } from "@/components/Inputs/Toggle/IconToggleButton/IconToggleButton";
import { Separator } from "@/components/Layout/Separator/Separator";
import { RichTextEditorHeadingSelect } from "./RichTextEditorHeadingSelect";
import type {
  ToolbarButtonTool,
  ToolbarToolState,
} from "./RichTextEditorToolbar.hooks";
import styles from "./RichTextEditorToolbar.module.css";
import { TOOL_REGISTRY } from "./toolRegistry";

interface RichTextEditorToolbarSectionProps {
  /** The editor whose heading control is rendered. */
  editor: Editor;
  /** Tools and their current selected/enabled flags. */
  group: ToolbarToolState[];
  /** Position within the current bar, used to separate sections. */
  index: number;
  /** Matches the other controls in the editor. */
  size: FieldSize;
  /** Disables every control in the section. */
  isDisabled?: boolean;
  /** Whether this section is rendered in the overflow popover. */
  inOverflow?: boolean;
  /** Keeps a hidden primary-bar section measurable but inert. */
  isOverflowed?: boolean;
  /** Anchors the link form to its primary-bar section. */
  linkAnchorRef?: Ref<HTMLDivElement>;
  /** Runs a button command or opens its link form. */
  onPress: (tool: ToolbarButtonTool, inOverflow: boolean) => void;
  /** Dismisses overflow after a heading is selected. */
  onHeadingChange: () => void;
}

/** One formatting group, shared by the primary and overflow toolbars. */
export function RichTextEditorToolbarSection({
  editor,
  group,
  index,
  size,
  isDisabled,
  inOverflow = false,
  isOverflowed = false,
  linkAnchorRef,
  onPress,
  onHeadingChange,
}: RichTextEditorToolbarSectionProps) {
  return (
    <div
      className={styles.section}
      data-toolbar-section={inOverflow ? undefined : ""}
      data-overflowed={isOverflowed || undefined}
      aria-hidden={isOverflowed || undefined}
      inert={isOverflowed}
    >
      {index > 0 && <Separator />}
      <div
        className={styles.group}
        ref={
          group.some(({ tool }) => tool === "link") ? linkAnchorRef : undefined
        }
      >
        {group.map((state) => {
          if (state.tool === "heading") {
            return (
              <RichTextEditorHeadingSelect
                key="heading"
                editor={editor}
                size={size}
                isDisabled={isDisabled}
                onChange={onHeadingChange}
              />
            );
          }
          const { tool, isActive, isEnabled } = state;
          const { label, icon: Icon } = TOOL_REGISTRY[tool];
          return (
            <IconToggleButton
              key={tool}
              aria-label={label}
              variant="quiet"
              size={size}
              isSelected={isActive}
              isDisabled={isDisabled || !isEnabled}
              onChange={() => onPress(tool, inOverflow)}
            >
              <Icon aria-hidden="true" />
            </IconToggleButton>
          );
        })}
      </div>
    </div>
  );
}
