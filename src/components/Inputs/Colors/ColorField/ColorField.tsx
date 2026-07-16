"use client";
import clsx from "clsx";
import {
  ColorField as AriaColorField,
  type ColorFieldProps as AriaColorFieldProps,
  Input,
  type ValidationResult,
} from "react-aria-components/ColorField";
import { Description, FieldError, Label } from "@/components/Inputs/Form/Form";
import utils from "@/styles/utilities.module.css";
import textFieldStyles from "@/components/Inputs/TextField/TextField.module.css";
import styles from "./ColorField.module.css";

export interface ColorFieldProps extends AriaColorFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
}

export function ColorField({
  label,
  description,
  errorMessage,
  placeholder,
  ...props
}: ColorFieldProps) {
  return (
    <AriaColorField
      {...props}
      className={clsx("react-aria-ColorField", styles.colorField)}
    >
      {label && <Label>{label}</Label>}
      <Input
        className={clsx("react-aria-Input", textFieldStyles.input, utils.inset)}
        placeholder={placeholder}
      />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaColorField>
  );
}
