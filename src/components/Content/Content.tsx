import clsx from "clsx";
import {
  Heading as AriaHeading,
  type HeadingProps,
} from "react-aria-components/Heading";
import { Text as AriaText, type TextProps } from "react-aria-components/Text";
import styles from "./Content.module.css";

export function Heading(props: HeadingProps) {
  return (
    <AriaHeading
      {...props}
      className={clsx("react-aria-Heading", styles.heading, props.className)}
    />
  );
}

export function Text(props: TextProps) {
  return <AriaText {...props} />;
}
