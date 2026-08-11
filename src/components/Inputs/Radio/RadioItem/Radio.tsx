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
import base from "@/styles/base.module.css";
import styles from "./Radio.module.css";

export interface RadioProps extends RadioFieldProps {
  /** Helper text rendered below the option. */
  description?: string;
  /** Control size. Inherits its RadioGroup's size unless set; `"md"` alone. */
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
            <div className={clsx(base.indicator, styles.indicator)} />
            {children}
          </>
        ))}
      </RadioButton>
      {props.description && <Description>{props.description}</Description>}
    </RadioField>
  );
}
