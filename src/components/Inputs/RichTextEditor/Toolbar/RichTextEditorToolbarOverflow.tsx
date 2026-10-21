"use client";
import { EllipsisVertical } from "lucide-react";
import type { ReactNode, Ref } from "react";
import { IconButton } from "@/components/Actions/IconButton/IconButton";
import { Toolbar } from "@/components/Actions/Toolbar/Toolbar";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
import { Dialog, DialogTrigger } from "@/components/Overlays/Dialog/Dialog";
import { Popover } from "@/components/Overlays/Popover/Popover";
import styles from "./RichTextEditorToolbar.module.css";

interface RichTextEditorToolbarOverflowProps {
  /** Matches the primary toolbar's control size. */
  size: FieldSize;
  /** Prevents opening overflow when the editor cannot be edited. */
  isDisabled?: boolean;
  /** Anchors link entry opened from overflow to the persistent More button. */
  anchorRef: Ref<HTMLDivElement>;
  /** Whether the additional formatting controls are visible. */
  isOpen: boolean;
  /** Updates visibility when the trigger or popover is dismissed. */
  onOpenChange: (isOpen: boolean) => void;
  /** Sections that do not fit in the primary toolbar. */
  children: ReactNode;
}

/** The More button and its additional formatting bar. */
export function RichTextEditorToolbarOverflow({
  size,
  isDisabled,
  anchorRef,
  isOpen,
  onOpenChange,
  children,
}: RichTextEditorToolbarOverflowProps) {
  return (
    <div ref={anchorRef} className={styles.group}>
      <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
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
              {children}
            </Toolbar>
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  );
}
