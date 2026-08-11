"use client";
import clsx from "clsx";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import {
  Modal,
  ModalOverlay,
  type ModalOverlayProps,
} from "react-aria-components/Modal";
import { Dialog } from "@/components/Overlays/Dialog/Dialog";
import styles from "./Sheet.module.css";

export function Sheet(props: ModalOverlayProps) {
  return (
    <ModalOverlay className={clsx("sheet-overlay", styles.sheetOverlay)}>
      {composeRenderProps(props.children, (children) => (
        <Modal className={clsx("sheet", styles.sheet)}>
          <Dialog>{children}</Dialog>
        </Modal>
      ))}
    </ModalOverlay>
  );
}

// `Heading` is not re-exported here — Typography/Heading is the canonical one.
// See the note in Actions/Menu/Menu.tsx.
