"use client";
import clsx from "clsx";
import { Button, type ButtonProps } from "react-aria-components/Button";
import styles from "./FieldButton.module.css";

export function FieldButton(props: ButtonProps) {
  return (
    <Button
      {...props}
      className={clsx("field-Button", styles.fieldButton, props.className)}
    />
  );
}
