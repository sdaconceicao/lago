"use client";
import {
  type DialogProps,
  type DialogTriggerProps,
  Heading,
  Dialog as RACDialog,
  DialogTrigger as RACDialogTrigger,
} from "react-aria-components/Dialog";
import "./Dialog.css";

export function Dialog(props: DialogProps) {
  return <RACDialog {...props} />;
}

export function DialogTrigger(props: DialogTriggerProps) {
  return <RACDialogTrigger {...props} />;
}

export { Heading };
