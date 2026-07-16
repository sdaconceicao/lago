"use client";
import clsx from "clsx";
import {
  type DialogProps,
  type DialogTriggerProps,
  Heading,
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
      className={props.className ?? clsx("react-aria-Dialog", styles.dialog)}
    />
  );
}

Dialog.Header = DialogHeader;
Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;

export function DialogTrigger(props: DialogTriggerProps) {
  return <RACDialogTrigger {...props} />;
}

export { DialogBody, DialogFooter, DialogHeader, Heading };
export type { DialogBodyProps, DialogFooterProps, DialogHeaderProps };
