"use client";
import clsx from "clsx";
import type React from "react";
import { Group } from "react-aria-components/Group";
import {
  TextField as AriaTextField,
  Input,
} from "react-aria-components/TextField";
import {
  DEFAULT_FIELD_SIZE,
  Description,
  FieldError,
  Label,
} from "@/components/Inputs/FormComponents/index";
import type { TextFieldProps } from "@/components/Inputs/TextField/TextField";
import utils from "@/styles/utilities.module.css";
import { AffixContext } from "./AffixContext";
import {
  type TextFieldWithAffixesChange,
  useAffixesChange,
} from "./TextFieldWithAffixes.hooks";
import styles from "./TextFieldWithAffixes.module.css";

export interface TextFieldWithAffixesProps<T = HTMLInputElement>
  extends Omit<TextFieldProps<T>, "onChange"> {
  /**
   * Content rendered in its own segment before the input, separated from it by
   * a vertical border. Static content such as `"https://"` or an icon, or a
   * dropdown — see AffixSelect.
   */
  prefix?: React.ReactNode;
  /**
   * Content rendered in its own segment after the input, separated from it by a
   * vertical border. Static content such as `".com"` or an icon, or a dropdown
   * — see AffixSelect.
   */
  suffix?: React.ReactNode;
  /**
   * Called whenever any part of the value changes: typing in the input, or
   * picking a new option in a prefix or suffix dropdown.
   *
   * Unlike TextField's `onChange`, which receives only the text, this receives
   * the whole value — the text alongside the current prefix and suffix
   * selections — so a handler never has to correlate separate callbacks. Static
   * affixes contribute nothing, having no value to select.
   */
  onChange?: (change: TextFieldWithAffixesChange) => void;
}

/**
 * A text input flanked by an optional prefix and suffix, all sharing a single
 * inset field surface with a vertical border between each segment. Use it for
 * values that read as one unit with a fixed part — a URL scheme, a currency, a
 * unit of measure — where the fixed part is either static text or a dropdown.
 *
 * Accepts every TextField prop, so it is a drop-in replacement wherever an affix
 * is needed, and its metrics match the other fields at the same size. Only
 * `onChange` differs: it reports the input and the affixes as one value.
 */
export function TextFieldWithAffixes({
  label,
  description,
  errorMessage,
  placeholder,
  inputRef,
  button,
  prefix,
  suffix,
  onChange,
  size = DEFAULT_FIELD_SIZE,
  ...props
}: TextFieldWithAffixesProps) {
  const { onInputChange, prefixContext, suffixContext } = useAffixesChange({
    size,
    value: props.value,
    defaultValue: props.defaultValue,
    onChange,
  });

  return (
    <AriaTextField
      {...props}
      onChange={onInputChange}
      data-field-size={size}
      className={clsx(
        "react-aria-TextField",
        styles.textField,
        props.className
      )}
    >
      {label && <Label isRequired={props.isRequired}>{label}</Label>}
      {/* One inset surface shared by every segment. The separators are drawn on
          the segments themselves so they pick up the field's border color,
          including its hover, invalid, and disabled states. */}
      <Group
        isDisabled={props.isDisabled}
        isInvalid={props.isInvalid}
        className={clsx("react-aria-Group", styles.group, utils.inset)}
      >
        {prefix != null && (
          <div className={clsx(styles.segment, styles.affix)}>
            <AffixContext.Provider value={prefixContext}>
              {prefix}
            </AffixContext.Provider>
          </div>
        )}
        <div
          className={clsx(
            styles.segment,
            styles.inputSegment,
            button && styles.hasButton
          )}
        >
          <Input
            ref={inputRef}
            className={clsx("react-aria-Input", styles.input)}
            placeholder={placeholder}
          />
          {button}
        </div>
        {suffix != null && (
          <div className={clsx(styles.segment, styles.affix)}>
            <AffixContext.Provider value={suffixContext}>
              {suffix}
            </AffixContext.Provider>
          </div>
        )}
      </Group>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTextField>
  );
}

export type { AffixContextValue, AffixKey } from "./AffixContext";
export { AffixContext, useAffixContext } from "./AffixContext";
export type { AffixSelectProps } from "./BaseComponents/AffixSelect";
export { AffixSelect } from "./BaseComponents/AffixSelect";
export type {
  AffixSlot,
  TextFieldWithAffixesChange,
} from "./TextFieldWithAffixes.hooks";
