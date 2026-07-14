"use client";
import clsx from "clsx";
import {
  Heading,
  Modal,
  ModalOverlay,
  type ModalOverlayProps,
} from "react-aria-components/Modal";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { Dialog } from "../Dialog/Dialog";
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

export { Heading };
