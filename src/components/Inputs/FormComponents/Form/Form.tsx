"use client";
import clsx from "clsx";
import { type FormProps, Form as RACForm } from "react-aria-components/Form";
import styles from "./Form.module.css";

/**
 * A form that stacks its fields in a column.
 *
 * Field size is set per field via each input's own `size` prop. The form
 * deliberately does not expose a `size` that cascades: every field renders its
 * own `data-field-size`, and a declaration on the element itself always beats
 * an inherited one, so a form-level attribute would style the labels without
 * resizing the fields. Form-wide sizing would need a React context, not CSS
 * inheritance.
 */
export function Form(props: FormProps) {
  return (
    <RACForm
      {...props}
      className={clsx("react-aria-Form", styles.form, props.className)}
    />
  );
}
