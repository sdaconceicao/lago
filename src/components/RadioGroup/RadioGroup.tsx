"use client";
import clsx from "clsx";
import {
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  RadioButton,
  RadioField,
  type RadioFieldProps,
  type ValidationResult,
} from "react-aria-components/RadioGroup";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { Description, FieldError, Label } from "../Form/Form";
import utils from "../../styles/utilities.module.css";
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
      <Label>{label}</Label>
      <div className={clsx("radio-items", styles.radioItems)}>{children}</div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaRadioGroup>
  );
}

export interface RadioProps extends RadioFieldProps {
  description?: string;
}

export function Radio(props: RadioProps) {
  return (
    <RadioField
      {...props}
      className={clsx("react-aria-RadioField", styles.radioField)}
    >
      <RadioButton
        className={clsx("react-aria-RadioButton", styles.radioButton)}
      >
        {composeRenderProps(props.children, (children) => (
          <>
            <div className={clsx(utils.indicator, styles.indicator)} />
            {children}
          </>
        ))}
      </RadioButton>
      {props.description && <Description>{props.description}</Description>}
    </RadioField>
  );
}
