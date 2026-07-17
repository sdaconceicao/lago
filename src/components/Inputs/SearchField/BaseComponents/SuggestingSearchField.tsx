"use client";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Search, X } from "lucide-react";
import {
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  type ComboBoxState,
  type Key,
} from "react-aria-components/ComboBox";
import { Group } from "react-aria-components/Group";
import { Input } from "react-aria-components/SearchField";
import {
  DropdownItem,
  DropdownListBox,
} from "@/components/Collections/ListBox/ListBox";
import {
  Description,
  FieldButton,
  FieldError,
  Label,
} from "@/components/Inputs/FormComponents/index";
import textFieldStyles from "@/components/Inputs/TextField/TextField.module.css";
import { Popover } from "@/components/Overlays/Popover/Popover";
import utils from "@/styles/utilities.module.css";
import { useSearchSuggestions } from "../SearchField.hooks";
import type { SearchFieldProps } from "../SearchField.types";
import {
  DEFAULT_DEBOUNCE_DELAY,
  type SearchSuggestion,
  filterSuggestions,
} from "../SearchField.utils";
import { SuggestionsStateBridge } from "./SuggestionsStateBridge";
import styles from "../SearchField.module.css";

/**
 * The suggestions-enabled search field. Built on the same ComboBox, Popover,
 * and DropdownListBox stack as the Select so the dropdown looks and behaves
 * consistently. The input value and selection are fully controlled: picking a
 * suggestion fills the field and reports it via `onSuggestionSelect` without
 * holding a selection, so the same suggestion can be picked again later.
 */
export function SuggestingSearchField({
  label,
  description,
  errorMessage,
  placeholder,
  value: controlledValue,
  defaultValue,
  onChange,
  onSubmit,
  onClear,
  onSearch,
  debounceDelay = DEFAULT_DEBOUNCE_DELAY,
  suggestions,
  loadSuggestions,
  onSuggestionSelect,
  className,
  style,
  // Field props forwarded to the ComboBox. Listed explicitly rather than
  // spread because SearchField's render props (children/className/style/render)
  // are typed against SearchFieldRenderProps and don't apply to a ComboBox.
  id,
  name,
  isDisabled,
  isReadOnly,
  isRequired,
  isInvalid,
  autoFocus,
  validationBehavior,
  slot,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<ComboBoxState<SearchSuggestion> | null>(null);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const inputValue = controlledValue ?? internalValue;
  const [isOpen, setIsOpen] = useState(false);
  // The label of the suggestion just picked; used to skip re-searching when
  // the ComboBox echoes the selection back through onInputChange.
  const lastSelectedLabel = useRef<string | null>(null);
  // Last value reported through onChange, so a selection commit that fires both
  // the selection handler and onInputChange only reports once.
  const lastEmittedValue = useRef(inputValue);

  const { loadedSuggestions, isLoading, search, cancelSearch } =
    useSearchSuggestions({ onSearch, loadSuggestions, debounceDelay });

  const items = useMemo(
    () =>
      suggestions
        ? filterSuggestions(suggestions, inputValue)
        : loadedSuggestions,
    [suggestions, inputValue, loadedSuggestions]
  );

  const emitChange = useCallback(
    (next: string) => {
      if (lastEmittedValue.current === next) return;
      lastEmittedValue.current = next;
      onChange?.(next);
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (next: string) => {
      const fromSelection = lastSelectedLabel.current === next;
      lastSelectedLabel.current = null;
      setInternalValue(next);
      emitChange(next);
      if (fromSelection) return;
      search(next);
      // The menu trigger is "manual": opening on typing here (rather than
      // menuTrigger="input") stops the ComboBox from reopening the popover
      // when a selection or clear changes the controlled input value.
      if (next) {
        stateRef.current?.open(null, "manual");
      } else {
        stateRef.current?.close();
      }
    },
    [emitChange, search]
  );

  const handleSelectionChange = useCallback(
    (key: Key | null) => {
      if (key == null) return;
      const suggestion = items.find((item) => item.id === key);
      if (!suggestion) return;
      lastSelectedLabel.current = suggestion.label;
      cancelSearch();
      setInternalValue(suggestion.label);
      emitChange(suggestion.label);
      onSuggestionSelect?.(suggestion);
      stateRef.current?.close();
    },
    [items, cancelSearch, emitChange, onSuggestionSelect]
  );

  const clear = useCallback(() => {
    setInternalValue("");
    emitChange("");
    search("");
    onClear?.();
    stateRef.current?.close();
    inputRef.current?.focus();
  }, [emitChange, search, onClear]);

  const handleSubmitPress = useCallback(() => {
    onSubmit?.(inputValue);
    stateRef.current?.close();
  }, [onSubmit, inputValue]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        // Enter picks the highlighted suggestion (handled by the ComboBox);
        // with nothing highlighted it submits the query.
        if (!event.currentTarget.getAttribute("aria-activedescendant")) {
          onSubmit?.(inputValue);
        }
      } else if (event.key === "Escape" && !isOpen && inputValue) {
        // First Escape closes the dropdown (handled by the ComboBox); the
        // next clears the field, matching the plain SearchField.
        clear();
      }
    },
    [onSubmit, inputValue, isOpen, clear]
  );

  return (
    <AriaComboBox
      id={id}
      name={name}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      isInvalid={isInvalid}
      autoFocus={autoFocus}
      validationBehavior={validationBehavior}
      slot={slot}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      style={style as AriaComboBoxProps<SearchSuggestion>["style"]}
      allowsCustomValue
      allowsEmptyCollection
      menuTrigger="manual"
      items={items}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      // `value`/`onChange` are the non-deprecated ComboBox selection API.
      // Pinned to null so a pick is reported but never held as a selection,
      // which keeps the same suggestion pickable again after clearing.
      value={null}
      onChange={handleSelectionChange}
      onOpenChange={setIsOpen}
      className={clsx("react-aria-ComboBox", styles.searchField, className)}
    >
      <SuggestionsStateBridge stateRef={stateRef} />
      {label && <Label isRequired={isRequired}>{label}</Label>}
      {/* The Group is wired up by the ComboBox: the popover is positioned
          against it and it gets data-hovered/focus/disabled/invalid states. */}
      <Group
        className={clsx("react-aria-Group", textFieldStyles.field, utils.inset)}
      >
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className={clsx(
            "react-aria-Input",
            textFieldStyles.fieldInput,
            styles.input
          )}
        />
        {inputValue !== "" && (
          <FieldButton
            slot={null}
            aria-label="Clear search"
            isDisabled={isDisabled}
            onPress={clear}
          >
            <X />
          </FieldButton>
        )}
        <FieldButton
          slot={null}
          aria-label="Search"
          isDisabled={isDisabled}
          onPress={handleSubmitPress}
        >
          <Search />
        </FieldButton>
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow className={styles.searchPopover}>
        <DropdownListBox<SearchSuggestion>
          renderEmptyState={() =>
            isLoading ? "Searching…" : "No results found."
          }
        >
          {(item) => <DropdownItem id={item.id}>{item.label}</DropdownItem>}
        </DropdownListBox>
      </Popover>
    </AriaComboBox>
  );
}
