"use client";
import clsx from "clsx";
import {
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  type ValidationResult,
} from "react-aria-components/RadioGroup";
import {
  Description,
  FieldError,
  Label,
} from "@/components/Inputs/FormComponents/index";
import styles from "./RadioGroup.module.css";

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, "children"> {
  children?: React.ReactNode;
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function RadioGroup({
  label,
  description,
  errorMessage,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <AriaRadioGroup
      {...props}
      className={clsx("react-aria-RadioGroup", styles.radioGroup)}
    >
      <Label isRequired={props.isRequired}>{label}</Label>
      <div className={clsx("radio-items", styles.radioItems)}>{children}</div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaRadioGroup>
  );
}
