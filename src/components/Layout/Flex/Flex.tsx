import clsx from "clsx";
import type { ElementType } from "react";
import styles from "./Flex.module.css";
import type { FlexElement, FlexProps } from "./Flex.types";
import { getFlexStyle } from "./Flex.utils";

export type {
  FlexElement,
  FlexLayoutProps,
  FlexProps,
  LayoutBreakpoint,
  LayoutGap,
  ResponsiveValue,
} from "./Flex.types";

/** A server-renderable flex container with CSS-driven, mobile-first overrides. */
export function Flex<T extends FlexElement = "div">({
  elementType,
  direction,
  align,
  justify,
  wrap,
  gap,
  rowGap,
  columnGap,
  inline = false,
  className,
  style,
  ...props
}: FlexProps<T>) {
  const Element = (elementType ?? "div") as ElementType;

  return (
    <Element
      {...props}
      className={clsx("lago-flex", styles.flex, className)}
      data-inline={inline || undefined}
      style={{
        ...getFlexStyle({
          direction,
          align,
          justify,
          wrap,
          gap,
          rowGap,
          columnGap,
        }),
        ...style,
      }}
    />
  );
}
