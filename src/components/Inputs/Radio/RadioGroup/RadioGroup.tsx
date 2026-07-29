"use client";
import clsx from "clsx";
import {
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  type ValidationResult,
} from "react-aria-components/RadioGroup";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import styles from "./RadioGroup.module.css";

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, "children"> {
  /** The Radio items belonging to the group. */
  children?: React.ReactNode;
  /** Accessible label rendered above the group. */
  label?: string;
  /** Helper text rendered below the group. */
  description?: string;
  /** Error message shown when the group is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /**
   * The size of the control, scaling the label text and the spacing between
   * options: `"sm"` pairs 12px text with a 16px indicator and 8px between
   * options, `"md"` (the default) 14px text with an 18px indicator and 10px
   * between options, and `"lg"` 14px text with an 18px indicator and 12px
   * between options. The indicator itself steps only once, from `sm` to `md`,
   * because 18px already reads small. Every Radio inside the group inherits this
   * size unless it sets its own.
   *
   * @default 'md'
   */
  size?: FieldSize;
}

export function RadioGroup({
  label,
  description,
  errorMessage,
  children,
  size = DEFAULT_FIELD_SIZE,
  ...props
}: RadioGroupProps) {
  return (
    <AriaRadioGroup
      {...props}
      data-field-size={size}
      className={clsx("react-aria-RadioGroup", styles.radioGroup)}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      <div className={clsx("radio-items", styles.radioItems)}>{children}</div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaRadioGroup>
  );
}
