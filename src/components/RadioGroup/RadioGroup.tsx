"use client";
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
import "../../styles/utilities.css";
import "./RadioGroup.css";

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
    <AriaRadioGroup {...props}>
      <Label>{label}</Label>
      <div className="radio-items">{children}</div>
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
    <RadioField {...props}>
      <RadioButton>
        {composeRenderProps(props.children, (children) => (
          <>
            <div className="indicator" />
            {children}
          </>
        ))}
      </RadioButton>
      {props.description && <Description>{props.description}</Description>}
    </RadioField>
  );
}
