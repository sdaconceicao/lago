"use client";
import clsx from "clsx";
import {
  type FieldErrorProps,
  FieldError as RACFieldError,
} from "react-aria-components/FieldError";
import styles from "./FieldError.module.css";

export type { FieldErrorProps };

export function FieldError(props: FieldErrorProps) {
  return (
    <RACFieldError
      {...props}
      className={clsx(
        "react-aria-FieldError",
        styles.fieldError,
        props.className
      )}
    />
  );
}
