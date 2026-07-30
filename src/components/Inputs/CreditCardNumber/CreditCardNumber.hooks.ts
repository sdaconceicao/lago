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
import {
  type CardBrand,
  type CardBrandDefinition,
  formatCardNumber,
  getCardBrandDefinition,
  getCardDigits,
  getCaretPositionAfterDigits,
  getMaskedMaxLength,
} from "./CreditCardNumber.utils";

/** Layout effects are the right tool for caret work, but must not run on a server render. */
const useIsomorphicLayoutEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect;

export interface UseCreditCardNumberOptions {
  /** Controlled value. Accepts a masked or a raw number; it is re-masked either way. */
  value?: string;
  /** Uncontrolled initial value. Accepts a masked or a raw number. */
  defaultValue?: string;
  /** Called with the masked value whenever the user edits the field. */
  onChange?: (value: string) => void;
  /** Called when the detected brand changes, including back to null. */
  onBrandChange?: (brand: CardBrand | null) => void;
  /** Consumer ref for the input, kept in sync with the one the mask needs. */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Consumer key handler, called before the mask handles the key. */
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

export interface UseCreditCardNumberResult {
  /** The masked value to render in the field. */
  value: string;
  /** The brand matched by the digits so far, or null while empty or ambiguous. */
  definition: CardBrandDefinition | null;
  /** Ref to spread onto the input; forwards to the consumer's ref as well. */
  inputRef: React.RefCallback<HTMLInputElement>;
  /** Change handler that re-masks the value and keeps the caret in place. */
  onChange: (value: string) => void;
  /** Key handler that makes Backspace and Delete step over group separators. */
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  /** Length of the longest masked value the current brand can produce. */
  maxLength: number;
}

/**
 * The masking state behind CreditCardNumber: it re-masks every edit, restores
 * the caret to the digit it was sitting next to, and reports the detected brand.
 *
 * Each edit produces a new state object even when the masked value is unchanged
 * — typing a letter, say — because that render is what puts the field back in
 * sync with the mask and gives the effect below a chance to place the caret.
 */
export const useCreditCardNumber = ({
  value,
  defaultValue,
  onChange,
  onBrandChange,
  inputRef: forwardedRef,
  onKeyDown,
}: UseCreditCardNumberOptions): UseCreditCardNumberResult => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingCaretRef = useRef<number | null>(null);
  const [state, setState] = useState(() => ({
    value: formatCardNumber(value ?? defaultValue ?? ""),
    revision: 0,
  }));

  const displayValue = useMemo(
    () => (value === undefined ? state.value : formatCardNumber(value)),
    [value, state.value]
  );

  const definition = useMemo(
    () => getCardBrandDefinition(displayValue),
    [displayValue]
  );

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
    (nextValue: string) => {
      const caret = inputRef.current?.selectionStart ?? nextValue.length;
      // Anchor to the digit the caret was next to: the mask shifts the spaces
      // around it, so the character offset on its own means nothing.
      const digitsBeforeCaret = getCardDigits(nextValue.slice(0, caret)).length;
      const nextDefinition = getCardBrandDefinition(nextValue);
      const masked = formatCardNumber(nextValue, nextDefinition);

      pendingCaretRef.current = getCaretPositionAfterDigits(
        masked,
        digitsBeforeCaret
      );
      setState((previous) => ({
        value: masked,
        revision: previous.revision + 1,
      }));
      onChange?.(masked);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);

      // react-aria hands keyboard handlers a copy of the React event, so its
      // `defaultPrevented` is a snapshot taken before the consumer saw it; only
      // the method reports what the consumer just did.
      if (event.isDefaultPrevented()) {
        return;
      }

      const input = event.currentTarget;
      const { selectionStart, selectionEnd } = input;

      // Only a collapsed caret needs help; a selection deletes what it covers.
      if (selectionStart === null || selectionStart !== selectionEnd) {
        return;
      }

      // Deleting a group separator would only put it straight back, costing the
      // user a keypress, so step over it and let the browser delete the digit.
      if (
        event.key === "Backspace" &&
        input.value[selectionStart - 1] === " "
      ) {
        input.setSelectionRange(selectionStart - 1, selectionStart - 1);
      } else if (
        event.key === "Delete" &&
        input.value[selectionStart] === " "
      ) {
        input.setSelectionRange(selectionStart + 1, selectionStart + 1);
      }
    },
    [onKeyDown]
  );

  useIsomorphicLayoutEffect(() => {
    const caret = pendingCaretRef.current;
    pendingCaretRef.current = null;
    const input = inputRef.current;

    if (caret === null || !input) {
      return;
    }

    // Committing the render is what puts a rejected keystroke back — React
    // rewrites a controlled input whenever the field holds something other than
    // the value it was given — so the caret is placed once that has happened.
    if (input === document.activeElement) {
      input.setSelectionRange(caret, caret);
    }
  }, [state]);

  const brand = definition?.brand ?? null;
  const previousBrandRef = useRef(brand);

  useEffect(() => {
    if (previousBrandRef.current === brand) {
      return;
    }

    previousBrandRef.current = brand;
    onBrandChange?.(brand);
  }, [brand, onBrandChange]);

  const maxLength = useMemo(() => getMaskedMaxLength(definition), [definition]);

  return {
    value: displayValue,
    definition,
    inputRef: setInputRef,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    maxLength,
  };
};
