"use client";
import type { RefObject } from "react";
import { Button } from "@/components/Actions/Button/Button";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
import { TextField } from "@/components/Inputs/TextField/TextField";
import { Dialog } from "@/components/Overlays/Dialog/Dialog";
import { Popover } from "@/components/Overlays/Popover/Popover";
import styles from "./RichTextEditorToolbar.module.css";

interface RichTextEditorLinkPopoverProps {
  /** The current primary-section or More-button anchor. */
  triggerRef: RefObject<HTMLDivElement | null>;
  /** Whether URL entry is visible. */
  isOpen: boolean;
  /** Updates visibility when the popover is dismissed. */
  onOpenChange: (isOpen: boolean) => void;
  /** URL being entered. */
  href: string;
  /** Updates the entered URL. */
  onHrefChange: (href: string) => void;
  /** Applies the URL to the editor's current selection. */
  onSubmit: () => void;
  /** Matches the toolbar's control size. */
  size: FieldSize;
  /** Prevents URL entry and submission when the editor cannot be edited. */
  isDisabled?: boolean;
}

/** URL entry whose submission stays isolated from surrounding forms. */
export function RichTextEditorLinkPopover({
  triggerRef,
  isOpen,
  onOpenChange,
  href,
  onHrefChange,
  onSubmit,
  size,
  isDisabled,
}: RichTextEditorLinkPopoverProps) {
  return (
    <Popover
      triggerRef={triggerRef}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="bottom start"
    >
      <Dialog aria-label="Add link" className={styles.linkDialog}>
        <form
          className={styles.linkForm}
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onSubmit();
          }}
        >
          <TextField
            autoFocus
            label="URL"
            size={size}
            type="url"
            placeholder="https://example.com"
            value={href}
            onChange={onHrefChange}
            isDisabled={isDisabled}
          />
          <Button size={size} type="submit" isDisabled={isDisabled}>
            Add link
          </Button>
        </form>
      </Dialog>
    </Popover>
  );
}
