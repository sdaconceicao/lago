"use client";
import clsx from "clsx";
import { useCallback, useMemo } from "react";
import ReactCountryFlag from "react-country-flag";
import { DropdownItem } from "@/components/Collections/ListBox/ListBox";
import type { TextFieldProps } from "@/components/Inputs/TextField/TextField";
import {
  AffixSelect,
  TextFieldWithAffixes,
  type TextFieldWithAffixesChange,
} from "@/components/Inputs/TextFieldWithAffixes/TextFieldWithAffixes";
import { useTelephoneField } from "./TelephoneField.hooks";
import styles from "./TelephoneField.module.css";
import {
  getTelephonePlaceholder,
  type TelephoneFormat,
} from "./TelephoneField.utils";

export interface TelephoneFieldProps
  extends Omit<
    TextFieldProps,
    "type" | "children" | "suffix" | "minLength" | "maxLength"
  > {
  /** Controlled full number, including its calling code. Accepts formatted or unformatted international text. */
  value?: string;
  /** Initial full number or national digits. National input uses defaultCountry, or US. */
  defaultValue?: string;
  /** Receives the full formatted number including its calling code on each edit, or an empty string when cleared. */
  onChange?: (value: string) => void;
  /** Controlled ISO country code. Supply it to distinguish countries sharing a calling code. */
  country?: string;
  /** Initial ISO country code. Empty and national values default to US; existing international numbers use their supplied data. */
  defaultCountry?: string;
  /** Called once when the user selects a country. Programmatic value changes do not fire it. */
  onCountryChange?: (country: string) => void;
  /** Include only these ISO country codes. An empty list allows no selections. */
  onlyCountries?: readonly string[];
  /** Exclude these ISO country codes, including any present in onlyCountries. */
  excludeCountries?: readonly string[];
  /** National digit punctuation: parentheses (default), spaces, dashes, or digits only. Every emitted nonempty value includes its calling code. */
  format?: TelephoneFormat;
  /** Custom national mask: # marks editable digits; numeric literals stay fixed and are included in the value. Matching supplied literals are consumed once. Overrides format; remaining valid digits follow the mask. */
  mask?: string;
  /** Custom hint instead of the automatic country/format placeholder. An empty string hides the hint. */
  placeholder?: string;
  /** Accessible name for the country dropdown. Defaults to "Country calling code". */
  countryLabel?: string;
  /** Base URL for lowercase country SVG filenames. Defaults to version-pinned flag-icons on jsDelivr; supports self-hosting. */
  flagCdnUrl?: string;
}

/**
 * A masked telephone field with a calling-code selector and CDN-backed country flags.
 * Reset through controlled value and country props; native form.reset() is not supported.
 */
export function TelephoneField({
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
  placeholder,
  countryLabel = "Country calling code",
  flagCdnUrl = "https://cdn.jsdelivr.net/npm/flag-icons@7.6.0/flags/4x3/",
  inputRef,
  onKeyDown,
  name,
  form,
  validate,
  autoComplete = "tel-national",
  inputMode = "tel",
  autoCorrect = "off",
  spellCheck = "false",
  ...props
}: TelephoneFieldProps) {
  const phone = useTelephoneField({
    value,
    defaultValue,
    onChange,
    country,
    defaultCountry,
    onCountryChange,
    onlyCountries,
    excludeCountries,
    format,
    mask,
    inputRef,
    onKeyDown,
  });
  const countries = useMemo(() => {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return phone.countries.map((entry) => ({
      ...entry,
      name: names.of(entry.country) ?? entry.country,
    }));
  }, [phone.countries]);
  const handleChange = useCallback(
    (change: TextFieldWithAffixesChange) => {
      // AffixSelect also reports selections through the enclosing field. Its
      // own handler owns those edits so the full-number callback fires once.
      if (change.value !== phone.inputValue) phone.onChange(change.value);
    },
    [phone.inputValue, phone.onChange]
  );
  const validateNumber = useCallback(
    () => validate?.(phone.value),
    [validate, phone.value]
  );
  const callingCode = phone.callingCode ? `+${phone.callingCode}` : "+";
  const countryPlaceholder = useMemo(
    () => getTelephonePlaceholder(phone.country ?? undefined, format, mask),
    [phone.country, format, mask]
  );

  return (
    <>
      <TextFieldWithAffixes
        {...props}
        type="tel"
        placeholder={placeholder ?? countryPlaceholder}
        value={phone.inputValue}
        onChange={handleChange}
        onKeyDown={phone.onKeyDown}
        inputRef={phone.inputRef}
        name={name}
        inputName=""
        form={form}
        validate={validate ? validateNumber : undefined}
        autoComplete={autoComplete}
        inputMode={inputMode}
        autoCorrect={autoCorrect}
        spellCheck={spellCheck}
        className={clsx(styles.telephoneField, props.className)}
        prefix={
          <AffixSelect
            aria-label={countryLabel}
            selectedKey={phone.country}
            placeholder={callingCode}
            onSelectionChange={phone.onCountryChange}
            isDisabled={
              props.isDisabled || props.isReadOnly || countries.length === 0
            }
            size={props.size}
            items={countries}
            renderValue={() => callingCode}
          >
            {(entry) => (
              <DropdownItem
                id={entry.country}
                textValue={`${entry.name} +${entry.callingCode}`}
                className={styles.countryOption}
              >
                <ReactCountryFlag
                  countryCode={entry.country}
                  svg
                  loading="lazy"
                  decoding="async"
                  cdnUrl={flagCdnUrl}
                  aria-hidden="true"
                  alt=""
                  className={styles.flag}
                  style={{
                    width: "calc(var(--field-icon-size) * 4 / 3)",
                    height: "var(--field-icon-size)",
                  }}
                />
                <span>{entry.name}</span>
                <span className={styles.callingCode}>+{entry.callingCode}</span>
              </DropdownItem>
            )}
          </AffixSelect>
        }
      />
      {name && (
        <input
          type="hidden"
          name={name}
          form={form}
          value={phone.value}
          disabled={props.isDisabled}
        />
      )}
    </>
  );
}

export type { TelephoneCountryDefinition } from "./TelephoneField.countries";
export { TELEPHONE_COUNTRIES } from "./TelephoneField.countries";
export type { TelephoneFormat } from "./TelephoneField.utils";
export {
  formatTelephoneDigits,
  formatTelephoneValue,
  getTelephoneCountries,
  getTelephoneCountry,
  getTelephoneDigits,
  parseTelephoneValue,
} from "./TelephoneField.utils";
