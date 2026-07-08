"use client";
import {
  Heading,
  Modal,
  ModalOverlay,
  type ModalOverlayProps,
} from "react-aria-components/Modal";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { Dialog } from "../Dialog/Dialog";
import "./Sheet.css";

export function Sheet(props: ModalOverlayProps) {
  return (
    <ModalOverlay className="sheet-overlay">
      {composeRenderProps(props.children, (children) => (
        <Modal className="sheet">
          <Dialog>{children}</Dialog>
        </Modal>
      ))}
    </ModalOverlay>
  );
}

export { Heading };
