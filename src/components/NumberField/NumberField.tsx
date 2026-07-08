"use client";
import { Minus, Plus } from "lucide-react";
import {
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
  Group,
  Input,
  type ValidationResult,
} from "react-aria-components/NumberField";
import { Button } from "../Button/Button";
import { Description, FieldError, Label } from "../Form/Form";
import "./NumberField.css";

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
    <AriaNumberField {...props}>
      <Label>{label}</Label>
      <Group>
        <Input className="react-aria-Input inset" />
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
