"use client";
import clsx from "clsx";
import { Minus, Plus } from "lucide-react";
import {
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
  Group,
  Input,
  type ValidationResult,
} from "react-aria-components/NumberField";
import { Button } from "@/components/Actions/Button/Button";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldError,
  type FieldSize,
  Label,
} from "@/components/Inputs/FormComponents/index";
import textFieldStyles from "@/components/Inputs/TextField/TextField.module.css";
import utils from "@/styles/utilities.module.css";
import styles from "./NumberField.module.css";

export interface NumberFieldProps extends AriaNumberFieldProps {
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
 * A numeric input with increment and decrement steppers. Supports min, max, and
 * step constraints plus locale-aware formatting and parsing, and shares the
 * label, help text, and inset field styling of TextField.
 */
export function NumberField({
  label,
  description,
  errorMessage,
  size = DEFAULT_FIELD_SIZE,
  ...props
}: NumberFieldProps) {
  return (
    <AriaNumberField
      {...props}
      data-field-size={size}
      className={clsx(
        "react-aria-NumberField",
        styles.numberField,
        props.className
      )}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      <Group className={clsx("react-aria-Group", utils.inset)}>
        <Input
          className={clsx(
            "react-aria-Input",
            textFieldStyles.input,
            utils.inset
          )}
        />
        <Button slot="decrement" variant="secondary">
          <Minus />
        </Button>
        <Button slot="increment" variant="secondary">
          <Plus />
        </Button>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaNumberField>
  );
}
