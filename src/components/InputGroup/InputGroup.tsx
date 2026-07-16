"use client";
import { useId } from "react";
import clsx from "clsx";
import { Group, type GroupProps } from "react-aria-components/Group";
import { InputContext } from "react-aria-components/Input";
import { composeRenderProps } from "react-aria-components/composeRenderProps";
import { Label } from "../Inputs/Form/Form";
import utils from "../../styles/utilities.module.css";
import styles from "./InputGroup.module.css";

interface InputGroupProps extends GroupProps {
  label?: string;
}

export function InputGroup(props: InputGroupProps) {
  const id = useId();
  return (
    <div className={clsx("input-group", styles.inputGroup)}>
      {props.label && (
        <Label elementType="span" id={id}>
          {props.label}
        </Label>
      )}
      <Group
        {...props}
        aria-labelledby={id}
        className={clsx("react-aria-Group", utils.inset, props.className)}
      >
        {composeRenderProps(props.children, (children, renderProps) => (
          <InputContext.Provider value={{ disabled: renderProps.isDisabled }}>
            {children}
          </InputContext.Provider>
        ))}
      </Group>
    </div>
  );
}
