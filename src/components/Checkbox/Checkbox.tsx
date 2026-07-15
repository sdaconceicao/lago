"use client";
import type { ReactNode } from "react";
import clsx from "clsx";
import {
  CheckboxButton,
  CheckboxField,
  type CheckboxFieldProps,
  type ValidationResult,
} from "react-aria-components/Checkbox";
import { Description, FieldError } from "../Form/Form";
import { CheckboxIndicator } from "./CheckboxIndicator";
import styles from "./Checkbox.module.css";

interface CheckboxProps extends CheckboxFieldProps {
  children?: ReactNode;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function Checkbox({
  children,
  description,
  errorMessage,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxField
      {...props}
      className={clsx("react-aria-CheckboxField", styles.checkboxField)}
    >
      <CheckboxButton
        className={clsx("react-aria-CheckboxButton", styles.checkboxButton)}
      >
        {({ isIndeterminate }) => (
          <>
            <CheckboxIndicator isIndeterminate={isIndeterminate} />
            {children}
          </>
        )}
      </CheckboxButton>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </CheckboxField>
  );
}

export { CheckboxIndicator } from "./CheckboxIndicator";
export type { CheckboxIndicatorProps } from "./CheckboxIndicator";
