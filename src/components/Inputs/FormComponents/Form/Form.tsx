"use client";
import clsx from "clsx";
import { type FormProps, Form as RACForm } from "react-aria-components/Form";
import styles from "./Form.module.css";

export type { FormProps };

/** A form that stacks its fields in a column. */
export function Form(props: FormProps) {
  return (
    <RACForm
      {...props}
      className={clsx("react-aria-Form", styles.form, props.className)}
    />
  );
}
