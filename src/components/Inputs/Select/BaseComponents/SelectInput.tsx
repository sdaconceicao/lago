"use client";
import clsx from "clsx";
import { Input } from "react-aria-components/ComboBox";
import styles from "./SelectInput.module.css";

export interface SelectInputProps {
  /** Placeholder text for the search input. Shown only while nothing is selected. */
  placeholder?: string;
}

/**
 * The Select's search input. Mirrors the MultiSelect input so the two
 * controls line up exactly.
 */
export function SelectInput({ placeholder }: SelectInputProps) {
  return (
    <Input
      className={clsx("react-aria-Input", styles.input)}
      placeholder={placeholder}
    />
  );
}
