"use client";
import clsx from "clsx";
import type { ReactNode } from "react";
import {
  SwitchButton,
  SwitchField,
  type SwitchFieldProps,
  type ValidationResult,
} from "react-aria-components/Switch";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldError,
  type FieldSize,
} from "@/components/Inputs/FormComponents/index";
import utils from "@/styles/utilities.module.css";
import styles from "./Switch.module.css";

export interface SwitchProps extends Omit<SwitchFieldProps, "children"> {
  /** Label rendered next to the switch. */
  children: ReactNode;
  /** Helper text rendered below the switch. */
  description?: string;
  /** Error message shown when the switch is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /**
   * The size of the control. `"sm"` renders a compact variant matching 28px
   * fields and `"md"` (the default) the standard one.
   */
  size?: FieldSize;
}

export function Switch({
  children,
  description,
  errorMessage,
  size = DEFAULT_FIELD_SIZE,
  ...props
}: SwitchProps) {
  return (
    <SwitchField
      {...props}
      data-field-size={size}
      className={clsx("react-aria-SwitchField", styles.switchField)}
    >
      <SwitchButton
        className={clsx("react-aria-SwitchButton", styles.switchButton)}
      >
        {({ isSelected, isDisabled }) => (
          <>
            <div className={clsx("track", styles.track, utils.indicator)}>
              <div
                data-disabled={isDisabled || undefined}
                className={
                  isSelected
                    ? clsx("handle", styles.handle)
                    : clsx("handle", styles.handle, utils.indicator)
                }
              />
            </div>
            {children}
          </>
        )}
      </SwitchButton>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </SwitchField>
  );
}
