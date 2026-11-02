import clsx from "clsx";
import { Flex, type FlexElement, type FlexProps } from "../Flex/Flex";
import { withLayoutDefault } from "../Flex/Flex.utils";

/** Native element attributes and responsive layout controls for HStack. */
export type HStackProps<T extends FlexElement = "div"> = FlexProps<T>;

/** A centered horizontal stack. Direction, alignment, and spacing remain overridable. */
export function HStack<T extends FlexElement = "div">(props: HStackProps<T>) {
  return (
    <Flex<T>
      {...props}
      direction={withLayoutDefault(props.direction, "row")}
      align={withLayoutDefault(props.align, "center")}
      gap={withLayoutDefault(props.gap, 4)}
      className={clsx("lago-hstack", props.className)}
    />
  );
}
