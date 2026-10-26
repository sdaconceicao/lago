"use client";
import type React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AffixKey } from "../TextFieldWithAffixes/AffixContext";
import {
  formatTelephoneDigits,
  formatTelephoneInput,
  formatTelephoneValue,
  getTelephoneCaretPosition,
  getTelephoneCountries,
  getTelephoneCountry,
  getTelephoneDigits,
  limitTelephoneDigits,
  parseTelephoneValue,
  type TelephoneFormat,
} from "./TelephoneField.utils";

const useIsomorphicLayoutEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect;

export interface UseTelephoneFieldOptions {
  /** Controlled full telephone number, including its calling code. */
  value?: string;
  /** Initial full telephone number or national digits. */
  defaultValue?: string;
  /** Receives the formatted full number on each edit, or an empty string on clear. */
  onChange?: (value: string) => void;
  /** Controlled country selection. */
  country?: string;
  /** Initial country. Empty and local values otherwise start with US. */
  defaultCountry?: string;
  /** Receives deliberate country selections. */
  onCountryChange?: (country: string) => void;
  /** Limits the available countries to these ISO codes. */
  onlyCountries?: readonly string[];
  /** Removes these ISO codes from the available countries. */
  excludeCountries?: readonly string[];
  /** Punctuation style for national digits. */
  format?: TelephoneFormat;
  /** Custom mask, with # for each digit. */
  mask?: string;
  /** Consumer input ref. */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Consumer keyboard handler, called before masking handles deletion. */
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

/** Owns selection and masking while the field components own rendering. */
export function useTelephoneField({
  value,
  defaultValue,
  onChange,
  country,
  defaultCountry,
  onCountryChange,
  onlyCountries,
  excludeCountries,
  format = "parentheses",
  mask,
  inputRef: forwardedRef,
  onKeyDown,
}: UseTelephoneFieldOptions) {
  const [state, setState] = useState<{
    value: string;
    country?: string;
    revision: number;
    isCountryChange?: boolean;
    previous?: { value: string; country?: string };
  }>(() => ({
    value: value ?? defaultValue ?? "",
    country: defaultCountry,
    revision: 0,
  }));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingCaretRef = useRef<number | null>(null);
  const countries = useMemo(
    () => getTelephoneCountries(onlyCountries, excludeCountries),
    [onlyCountries, excludeCountries]
  );
  const parsed = useMemo(() => {
    // A controlled owner can decline an edit. Keep the last visible model
    // until its value/country props accept the proposed selection.
    const waitingForCountry =
      state.previous &&
      state.isCountryChange &&
      country !== undefined &&
      country.toUpperCase() !== state.country;
    const waitingForValue =
      state.previous &&
      value !== undefined &&
      getTelephoneDigits(value) !== getTelephoneDigits(state.value);
    const currentValue =
      value ??
      (waitingForCountry ? state.previous?.value : undefined) ??
      state.value;
    const result = parseTelephoneValue(
      currentValue,
      country ?? (waitingForValue ? state.previous?.country : state.country)
    );
    return !country &&
      !result.country &&
      currentValue.trimStart().startsWith("+")
      ? parseTelephoneValue(currentValue)
      : result;
  }, [value, state, country]);
  const selectedCountry =
    parsed.country &&
    countries.some((entry) => entry.country === parsed.country?.country)
      ? parsed.country
      : null;
  const inputValue = useMemo(
    () => formatTelephoneInput(parsed, countries, format, mask),
    [parsed, countries, format, mask]
  );
  const fullValue = formatTelephoneValue(parsed.callingCode, inputValue);

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef]
  );

  const handleChange = useCallback(
    (next: string) => {
      const caret = inputRef.current?.selectionStart ?? next.length;
      const pastedInternational = next.trimStart().startsWith("+");
      let nextParsed = pastedInternational
        ? parseTelephoneValue(next, country ?? state.country)
        : { ...parsed, digits: getTelephoneDigits(next) };
      if (pastedInternational && !country && !nextParsed.country) {
        nextParsed = parseTelephoneValue(next);
      }
      const digits = limitTelephoneDigits(
        nextParsed.digits,
        nextParsed.callingCode,
        nextParsed.country?.country
      );
      const formatted = formatTelephoneInput(
        { ...nextParsed, digits },
        countries,
        format,
        mask
      );
      const nextValue = formatTelephoneValue(nextParsed.callingCode, formatted);
      const digitsBeforeCaret =
        getTelephoneDigits(next.slice(0, caret)).length -
        (pastedInternational ? nextParsed.callingCode.length : 0);
      pendingCaretRef.current = getTelephoneCaretPosition(
        formatted,
        digitsBeforeCaret
      );
      setState((previous) => ({
        value: nextValue,
        country: nextParsed.country?.country,
        previous: { value: fullValue, country: parsed.country?.country },
        revision: previous.revision + 1,
      }));
      onChange?.(nextValue);
    },
    [
      country,
      state.country,
      parsed,
      countries,
      fullValue,
      format,
      mask,
      onChange,
    ]
  );

  const handleCountryChange = useCallback(
    (key: AffixKey) => {
      const definition = getTelephoneCountry(
        typeof key === "string" ? key : undefined
      );
      if (
        !definition ||
        !countries.includes(definition) ||
        definition.country === selectedCountry?.country
      ) {
        return;
      }
      const digits = limitTelephoneDigits(
        parsed.digits,
        definition.callingCode,
        definition.country
      );
      const formatted = formatTelephoneDigits(
        digits,
        definition.country,
        format,
        mask
      );
      const nextValue = formatTelephoneValue(definition.callingCode, formatted);
      setState((previous) => ({
        value: nextValue,
        country: definition.country,
        isCountryChange: true,
        previous: { value: fullValue, country: parsed.country?.country },
        revision: previous.revision + 1,
      }));
      onCountryChange?.(definition.country);
      onChange?.(nextValue);
    },
    [
      countries,
      selectedCountry?.country,
      parsed,
      fullValue,
      format,
      mask,
      onCountryChange,
      onChange,
    ]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.isDefaultPrevented()) return;
      const input = event.currentTarget;
      const { selectionStart, selectionEnd } = input;
      if (selectionStart === null || selectionStart !== selectionEnd) return;
      let position = selectionStart;
      if (event.key === "Backspace") {
        while (position > 0 && /\D/.test(input.value[position - 1]))
          position -= 1;
      } else if (event.key === "Delete") {
        while (
          position < input.value.length &&
          /\D/.test(input.value[position])
        )
          position += 1;
      }
      if (position !== selectionStart)
        input.setSelectionRange(position, position);
    },
    [onKeyDown]
  );

  useIsomorphicLayoutEffect(() => {
    const caret = pendingCaretRef.current;
    pendingCaretRef.current = null;
    const input = inputRef.current;
    if (caret !== null && input === document.activeElement) {
      input?.setSelectionRange(caret, caret);
    }
  }, [state]);

  return {
    value: fullValue,
    inputValue,
    callingCode: parsed.callingCode,
    country: selectedCountry?.country ?? null,
    countries,
    inputRef: setInputRef,
    onChange: handleChange,
    onCountryChange: handleCountryChange,
    onKeyDown: handleKeyDown,
  };
}
