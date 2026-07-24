"use client";
import clsx from "clsx";
import type { ReactNode } from "react";
import {
  CheckboxButton,
  CheckboxField,
  type CheckboxFieldProps,
  type ValidationResult,
} from "react-aria-components/Checkbox";
import {
  Description,
  FieldError,
} from "@/components/Inputs/FormComponents/index";
import styles from "./Checkbox.module.css";
import { CheckboxIndicator } from "./CheckboxIndicator";

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

export type { CheckboxIndicatorProps } from "./CheckboxIndicator";
export { CheckboxIndicator } from "./CheckboxIndicator";
