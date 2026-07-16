import clsx from "clsx";
import {
  Heading as AriaHeading,
  type HeadingProps,
} from "react-aria-components/Heading";
import styles from "./Heading.module.css";

export function Heading(props: HeadingProps) {
  return (
    <AriaHeading
      {...props}
      className={clsx("react-aria-Heading", styles.heading, props.className)}
    />
  );
}
