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
  type FieldSize,
} from "@/components/Inputs/FormComponents/index";
import styles from "./Checkbox.module.css";
import { CheckboxIndicator } from "./CheckboxIndicator";

export interface CheckboxProps extends CheckboxFieldProps {
  /** Label rendered next to the checkbox. */
  children?: ReactNode;
  /** Helper text rendered below the checkbox. */
  description?: string;
  /** Error message shown when the checkbox is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /**
   * The size of the control. `"sm"` renders a compact variant matching 28px
   * fields and `"md"` the standard one. Left unset, the checkbox inherits the
   * size of its CheckboxGroup, defaulting to `"md"` when it stands alone.
   */
  size?: FieldSize;
}

export function Checkbox({
  children,
  description,
  errorMessage,
  size,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxField
      {...props}
      // Deliberately undefined unless `size` was passed: a standalone checkbox
      // inherits `md` from `:root`, and one inside a group must not stamp its
      // own size over the group's scope.
      data-field-size={size}
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
