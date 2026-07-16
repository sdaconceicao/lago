"use client";
import clsx from "clsx";
import {
  ModalOverlay,
  type ModalOverlayProps,
  Modal as RACModal,
} from "react-aria-components/Modal";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import styles from "./Modal.module.css";

export function Modal(props: ModalOverlayProps) {
  return (
    <ModalOverlay
      {...props}
      className={clsx(
        "react-aria-ModalOverlay",
        styles.modalOverlay,
        props.className
      )}
    >
      {composeRenderProps(props.children, (children) => (
        <RACModal className={clsx("react-aria-Modal", styles.modal)}>
          {children}
        </RACModal>
      ))}
    </ModalOverlay>
  );
}
