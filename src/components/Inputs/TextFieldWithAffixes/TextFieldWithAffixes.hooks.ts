"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { FieldSize } from "@/components/Inputs/FormComponents/index";
import type { AffixContextValue, AffixKey } from "./AffixContext";

/** Which side of the field an affix renders on. */
export type AffixSlot = "prefix" | "suffix";

/** The whole value of a TextFieldWithAffixes. */
export interface TextFieldWithAffixesChange {
  /** The input's current text. */
  value: string;
  /**
   * Key selected in the prefix dropdown. Absent while the prefix is static or
   * unset — a static affix has no value to select.
   */
  prefix?: AffixKey;
  /** Key selected in the suffix dropdown. Absent while the suffix is static or unset. */
  suffix?: AffixKey;
}

export interface UseAffixesChangeOptions {
  /** Field size, passed through to each affix so portaled content can re-declare it. */
  size: FieldSize;
  /** Whether the field is disabled, passed through so a control in an affix can follow. */
  isDisabled?: boolean;
  /** The controlled text value, when the field is controlled. */
  value?: string;
  /** The initial text value, when the field is uncontrolled. */
  defaultValue?: string;
  /** Called with the whole value whenever the input or an affix changes. */
  onChange?: (change: TextFieldWithAffixesChange) => void;
}

export interface UseAffixesChangeResult {
  /** Handler for the underlying input's own change event. */
  onInputChange: (value: string) => void;
  /** Context for the prefix segment, with `reportValue` bound to that slot. */
  prefixContext: AffixContextValue;
  /** Context for the suffix segment, with `reportValue` bound to that slot. */
  suffixContext: AffixContextValue;
}

/**
 * Folds the input's text and the affixes' selections into a single value and
 * reports it through one `onChange`, whichever part the user changed.
 *
 * Affix selections arrive over AffixContext rather than through props, because
 * an affix is an opaque node to the field. The first report from a slot is that
 * dropdown announcing the selection it mounted with, so it only seeds the value
 * — it is not a change and must not fire `onChange`.
 */
export function useAffixesChange({
  size,
  isDisabled,
  value,
  defaultValue,
  onChange,
}: UseAffixesChangeOptions): UseAffixesChangeResult {
  const latest = useRef<TextFieldWithAffixesChange>({
    value: value ?? defaultValue ?? "",
  });

  // Read through a ref so the handlers below stay referentially stable: an affix
  // reports its starting selection from an effect keyed on them, and that effect
  // should not re-run just because the consumer passed a fresh arrow function.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // A controlled field's text can change without passing through onChange.
  useEffect(() => {
    if (value !== undefined) {
      latest.current = { ...latest.current, value };
    }
  }, [value]);

  const onInputChange = useCallback((next: string) => {
    latest.current = { ...latest.current, value: next };
    onChangeRef.current?.({ ...latest.current });
  }, []);

  const reportValue = useCallback((slot: AffixSlot, key: AffixKey) => {
    const isSeeded = slot in latest.current;
    const hasChanged = latest.current[slot] !== key;
    latest.current = { ...latest.current, [slot]: key };

    if (isSeeded && hasChanged) {
      onChangeRef.current?.({ ...latest.current });
    }
  }, []);

  const prefixContext = useMemo<AffixContextValue>(
    () => ({
      size,
      isDisabled,
      reportValue: (key) => reportValue("prefix", key),
    }),
    [size, isDisabled, reportValue]
  );
  const suffixContext = useMemo<AffixContextValue>(
    () => ({
      size,
      isDisabled,
      reportValue: (key) => reportValue("suffix", key),
    }),
    [size, isDisabled, reportValue]
  );

  return { onInputChange, prefixContext, suffixContext };
}
