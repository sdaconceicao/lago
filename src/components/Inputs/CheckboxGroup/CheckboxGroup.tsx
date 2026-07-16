"use client";
import clsx from "clsx";
import {
  CheckboxGroup as AriaCheckboxGroup,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
  type ValidationResult,
} from "react-aria-components/CheckboxGroup";
import { Description, FieldError, Label } from "@/components/Inputs/Form/index";
import styles from "./CheckboxGroup.module.css";

export interface CheckboxGroupProps extends Omit<
  AriaCheckboxGroupProps,
  "children"
> {
  children?: React.ReactNode;
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  orientation?: "horizontal" | "vertical";
}

export function CheckboxGroup({
  label,
  description,
  errorMessage,
  children,
  orientation = "vertical",
  ...props
}: CheckboxGroupProps) {
  return (
    <AriaCheckboxGroup
      {...props}
      data-orientation={orientation}
      className={clsx("react-aria-CheckboxGroup", styles.checkboxGroup)}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      <div className={clsx("checkbox-items", styles.checkboxItems)}>
        {children}
      </div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaCheckboxGroup>
  );
}
