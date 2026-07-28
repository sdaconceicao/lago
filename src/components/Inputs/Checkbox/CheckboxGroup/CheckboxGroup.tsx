"use client";
import clsx from "clsx";
import {
  CheckboxGroup as AriaCheckboxGroup,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
  type ValidationResult,
} from "react-aria-components/CheckboxGroup";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import styles from "./CheckboxGroup.module.css";

export interface CheckboxGroupProps
  extends Omit<AriaCheckboxGroupProps, "children"> {
  /** The Checkbox items belonging to the group. */
  children?: React.ReactNode;
  /** Accessible label rendered above the group. */
  label?: string;
  /** Helper text rendered below the group. */
  description?: string;
  /** Error message shown when the group is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /**
   * The direction the items are laid out in.
   *
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * The size of the control. `"sm"` renders a compact variant matching 28px
   * fields and `"md"` (the default) the standard one. Every Checkbox inside the
   * group inherits this size unless it sets its own.
   */
  size?: FieldSize;
}

export function CheckboxGroup({
  label,
  description,
  errorMessage,
  children,
  orientation = "vertical",
  size = DEFAULT_FIELD_SIZE,
  ...props
}: CheckboxGroupProps) {
  return (
    <AriaCheckboxGroup
      {...props}
      data-orientation={orientation}
      data-field-size={size}
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
