"use client";
import clsx from "clsx";
import {
  ColorField as AriaColorField,
  type ColorFieldProps as AriaColorFieldProps,
  Input,
  type ValidationResult,
} from "react-aria-components/ColorField";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import textFieldStyles from "@/components/Inputs/TextField/TextField.module.css";
import base from "@/styles/base.module.css";
import styles from "./ColorField.module.css";

export interface ColorFieldProps extends AriaColorFieldProps {
  /** Accessible label rendered above the field. */
  label?: string;
  /** Helper text rendered below the field. */
  description?: string;
  /** Error message shown when the field is invalid. Also accepts a function of the validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Placeholder text shown while the field is empty. */
  placeholder?: string;
  /** Field size: 28px, 36px (default), or 48px tall. */
  size?: FieldSize;
}

/**
 * A text input for entering a color value in a supported format such as hex or
 * RGB. Its field sizing and padding match the TextField, so the controls align
 * when stacked in a form.
 */
export function ColorField({
  label,
  description,
  errorMessage,
  placeholder,
  size = DEFAULT_FIELD_SIZE,
  ...props
}: ColorFieldProps) {
  return (
    <AriaColorField
      {...props}
      data-field-size={size}
      className={clsx(
        "react-aria-ColorField",
        styles.colorField,
        props.className
      )}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      <Input
        className={clsx("react-aria-Input", textFieldStyles.input, base.inset)}
        placeholder={placeholder}
      />
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaColorField>
  );
}
