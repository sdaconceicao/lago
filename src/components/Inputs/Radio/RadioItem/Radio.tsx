"use client";
import clsx from "clsx";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import {
  RadioButton,
  RadioField,
  type RadioFieldProps,
} from "react-aria-components/RadioGroup";
import {
  Description,
  type FieldSize,
} from "@/components/Inputs/FormComponents/index";
import utils from "@/styles/utilities.module.css";
import styles from "./Radio.module.css";

export interface RadioProps extends RadioFieldProps {
  /** Helper text rendered below the option. */
  description?: string;
  /**
   * The size of the control, scaling the indicator, the label text, and the gap
   * between them: `"sm"` is a 16px indicator with 12px text and a 4px gap,
   * `"md"` an 18px indicator with 14px text and a 6px gap, and `"lg"` an 18px
   * indicator with 14px text and an 8px gap. The indicator steps only once, from
   * `sm` to `md` — 18px already reads small and there is no legible size between
   * 16 and 18 — so `md` and `lg` differ in type spacing rather than in the
   * indicator. A Radio is not a field box, so it never takes on a field's height
   * and will not row-align with a TextField or Select.
   *
   * Left unset, the radio inherits the size of its RadioGroup, defaulting to
   * `"md"` when it stands alone.
   */
  size?: FieldSize;
}

/**
 * A single option within a RadioGroup. Renders the radio indicator alongside
 * its label and must be placed inside a RadioGroup, which manages selection,
 * keyboard navigation, and accessibility labeling.
 */
export function Radio({ size, ...props }: RadioProps) {
  return (
    <RadioField
      {...props}
      // Deliberately undefined unless `size` was passed: a standalone radio
      // inherits `md` from `:root`, and one inside a group must not stamp its
      // own size over the group's scope.
      data-field-size={size}
      className={clsx("react-aria-RadioField", styles.radioField)}
    >
      <RadioButton
        className={clsx("react-aria-RadioButton", styles.radioButton)}
      >
        {composeRenderProps(props.children, (children) => (
          <>
            <div className={clsx(utils.indicator, styles.indicator)} />
            {children}
          </>
        ))}
      </RadioButton>
      {props.description && <Description>{props.description}</Description>}
    </RadioField>
  );
}
