"use client";
import clsx from "clsx";
import {
  RadioButton,
  RadioField,
  type RadioFieldProps,
} from "react-aria-components/RadioGroup";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { Description } from "@/components/Inputs/FormComponents/index";
import utils from "@/styles/utilities.module.css";
import styles from "./Radio.module.css";

export interface RadioProps extends RadioFieldProps {
  /** Helper text rendered below the option. */
  description?: string;
}

/**
 * A single option within a RadioGroup. Renders the radio indicator alongside
 * its label and must be placed inside a RadioGroup, which manages selection,
 * keyboard navigation, and accessibility labeling.
 */
export function Radio(props: RadioProps) {
  return (
    <RadioField
      {...props}
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
