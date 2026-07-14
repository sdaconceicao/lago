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
import utils from "../../styles/utilities.module.css";
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
            <div
              className={clsx("indicator", utils.indicator, styles.indicator)}
            >
              <svg
                viewBox="0 0 18 18"
                aria-hidden="true"
                key={isIndeterminate ? "indeterminate" : "check"}
              >
                {isIndeterminate ? (
                  <rect x={1} y={7.5} width={16} height={3} />
                ) : (
                  <polyline points="2 9 7 14 16 4" />
                )}
              </svg>
            </div>
            {children}
          </>
        )}
      </CheckboxButton>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </CheckboxField>
  );
}
