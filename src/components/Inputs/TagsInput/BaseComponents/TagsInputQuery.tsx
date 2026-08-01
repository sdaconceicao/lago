"use client";
import clsx from "clsx";
import { useCallback, useContext } from "react";
import { ComboBoxStateContext, Input } from "react-aria-components/ComboBox";
import styles from "./TagsInputQuery.module.css";

export interface TagsInputQueryProps {
  /** Placeholder text for the input. Stays visible while tags are selected, since the tags sit below the field rather than inside it. */
  placeholder?: string;
  /** Adds the typed text as a tag. Returns whether the text was consumed, in which case the input is cleared. */
  onAddQuery: (query: string) => boolean;
}

/**
 * The TagsInput's query input. Reads the surrounding ComboBox state to turn Enter
 * into "add what I typed" and Backspace on an empty input into "drop the last
 * tag", so a tag can be added and removed without leaving the keyboard.
 */
export function TagsInputQuery({
  placeholder,
  onAddQuery,
}: TagsInputQueryProps) {
  const state = useContext(ComboBoxStateContext);

  // Key handling runs in the capture phase, before React Aria's own Enter
  // handling on the same input, so the choice between committing a highlighted
  // option and adding the raw text is made first.
  const onKeyDownCapture = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!state || !(event.target instanceof HTMLInputElement)) return;

      if (event.key === "Enter") {
        // An option is highlighted in the dropdown: React Aria selects it, and
        // the create row goes through the same path as any other option.
        if (event.target.getAttribute("aria-activedescendant")) return;
        if (!onAddQuery(state.inputValue)) return;
        event.preventDefault();
        event.stopPropagation();
        state.setInputValue("");
        return;
      }

      if (event.key === "Backspace" && state.inputValue === "") {
        const value = Array.isArray(state.value) ? state.value : [];
        if (value.length === 0) return;
        state.setValue(value.slice(0, -1));
      }
    },
    [state, onAddQuery]
  );

  return (
    <Input
      className={clsx("react-aria-Input", styles.input)}
      placeholder={placeholder}
      onKeyDownCapture={onKeyDownCapture}
    />
  );
}
