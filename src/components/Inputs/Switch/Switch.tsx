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
  Description,
  FieldError,
} from "@/components/Inputs/FormComponents/index";
import utils from "@/styles/utilities.module.css";
import styles from "./Switch.module.css";

export interface SwitchProps extends Omit<SwitchFieldProps, "children"> {
  children: ReactNode;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function Switch({
  children,
  description,
  errorMessage,
  ...props
}: SwitchProps) {
  return (
    <SwitchField
      {...props}
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
