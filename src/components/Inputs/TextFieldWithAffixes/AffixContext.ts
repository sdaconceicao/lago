"use client";
import { createContext, useContext } from "react";
import type { SelectProps as AriaSelectProps } from "react-aria-components/Select";
import {
  DEFAULT_FIELD_SIZE,
  type FieldSize,
} from "@/components/Inputs/FormComponents/index";

/**
 * The value an affix dropdown reports. Derived from react-aria's Select so the
 * two stay in step.
 */
export type AffixKey = Parameters<
  NonNullable<AriaSelectProps<object>["onSelectionChange"]>
>[0];

export interface AffixContextValue {
  /**
   * Field size of the enclosing TextFieldWithAffixes.
   *
   * Affixes rendered inside the field inherit the `--field-*` custom properties
   * from its `data-field-size` attribute, so they need no help. An affix that
   * portals content to the document body — a dropdown popover, say — escapes
   * that scope and has to re-declare the size itself.
   */
  size: FieldSize;
  /**
   * Reports this affix's selected value to the field, which folds it into the
   * `onChange` payload. Pre-bound to the slot the affix renders in, so an affix
   * never needs to know which side it is on.
   *
   * The first call registers the dropdown's starting selection and does not
   * count as a change; later calls fire the field's `onChange`.
   */
  reportValue?: (key: AffixKey) => void;
}

/**
 * Lets a dropdown affix talk to the field it renders in, so the field can
 * report affix selections through its own `onChange` without inspecting the
 * opaque node it was handed.
 */
export const AffixContext = createContext<AffixContextValue>({
  size: DEFAULT_FIELD_SIZE,
});

/** The enclosing field's affix context, or the defaults outside of one. */
export function useAffixContext(): AffixContextValue {
  return useContext(AffixContext);
}
