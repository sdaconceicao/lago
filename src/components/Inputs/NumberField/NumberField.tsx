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
import { Description, FieldError, Label } from "@/components/Inputs/Form/index";
import textFieldStyles from "@/components/Inputs/TextField/TextField.module.css";
import utils from "@/styles/utilities.module.css";
import styles from "./NumberField.module.css";

export interface NumberFieldProps extends AriaNumberFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  placeholder?: string;
}

export function NumberField({
  label,
  description,
  errorMessage,
  ...props
}: NumberFieldProps) {
  return (
    <AriaNumberField
      {...props}
      className={clsx(
        "react-aria-NumberField",
        styles.numberField,
        props.className
      )}
    >
      <Label isRequired={props.isRequired}>{label}</Label>
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
