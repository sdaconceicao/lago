"use client";
import clsx from "clsx";
import {
  type DialogProps,
  type DialogTriggerProps,
  Dialog as RACDialog,
  DialogTrigger as RACDialogTrigger,
} from "react-aria-components/Dialog";
import { DialogBody, type DialogBodyProps } from "./BaseComponents/DialogBody";
import {
  DialogFooter,
  type DialogFooterProps,
} from "./BaseComponents/DialogFooter";
import {
  DialogHeader,
  type DialogHeaderProps,
} from "./BaseComponents/DialogHeader";
import styles from "./Dialog.module.css";

export function Dialog(props: DialogProps) {
  return (
    <RACDialog
      {...props}
      className={clsx("react-aria-Dialog", styles.dialog, props.className)}
    />
  );
}

Dialog.Header = DialogHeader;
Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;

export function DialogTrigger(props: DialogTriggerProps) {
  return <RACDialogTrigger {...props} />;
}

export type {
  DialogBodyProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogProps,
  DialogTriggerProps,
};
// `Heading` is not re-exported here — Typography/Heading is the canonical one.
// See the note in Actions/Menu/Menu.tsx.
export { DialogBody, DialogFooter, DialogHeader };
