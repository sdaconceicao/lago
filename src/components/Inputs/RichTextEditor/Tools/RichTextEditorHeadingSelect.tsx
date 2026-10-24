"use client";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { ChevronDown } from "lucide-react";
import { useCallback } from "react";
import { Select, SelectValue } from "react-aria-components/Select";
import { Button } from "@/components/Actions/Button/Button";
import { DropdownListBox } from "@/components/Collections/ListBox/ListBox";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
import { SelectItem } from "@/components/Inputs/Select/Select";
import { Popover } from "@/components/Overlays/Popover/Popover";
import styles from "../Toolbar/RichTextEditorToolbar.module.css";

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

export interface RichTextEditorHeadingSelectProps {
  /** The editor whose selected block is formatted. */
  editor: Editor;
  /** Matches the other controls in the toolbar. */
  size: FieldSize;
  /** Prevents changes when the editor is disabled or read-only. */
  isDisabled?: boolean;
  /** Dismisses the overflow toolbar after a selection is applied. */
  onChange: () => void;
}

/** A block-style select synchronized with the editor's current selection. */
export function RichTextEditorHeadingSelect({
  editor,
  size,
  isDisabled,
  onChange,
}: RichTextEditorHeadingSelectProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      level:
        HEADING_LEVELS.find((level) =>
          current.isActive("heading", { level })
        ) ?? 0,
      canParagraph:
        current.isActive("paragraph") || current.can().setParagraph(),
      levels: HEADING_LEVELS.map((level) => ({
        level,
        isEnabled:
          current.isActive("heading", { level }) ||
          current.can().setHeading({ level }),
      })),
    }),
  });

  const handleSelectionChange = useCallback(
    (key: string | number | null) => {
      if (!editor.isEditable) return;
      // Keys are heading levels; an empty selection maps to normal text (0).
      const level = Number(key) as (typeof HEADING_LEVELS)[number] | 0;
      const chain = editor.chain().focus();
      if (level === 0) chain.setParagraph().run();
      else chain.setHeading({ level }).run();
      onChange();
    },
    [editor, onChange]
  );

  return (
    <Select
      aria-label="Heading"
      selectedKey={state.level}
      onSelectionChange={handleSelectionChange}
      isDisabled={isDisabled}
      className={styles.headingSelect}
    >
      <Button variant="quiet" size={size} className={styles.headingButton}>
        <SelectValue />
        <ChevronDown aria-hidden="true" />
      </Button>
      <Popover
        hideArrow
        data-field-size={size}
        className={styles.headingPopover}
      >
        <DropdownListBox>
          <SelectItem id={0} isDisabled={!state.canParagraph}>
            Normal text
          </SelectItem>
          {state.levels.map(({ level, isEnabled }) => (
            <SelectItem key={level} id={level} isDisabled={!isEnabled}>
              Heading {level}
            </SelectItem>
          ))}
        </DropdownListBox>
      </Popover>
    </Select>
  );
}
