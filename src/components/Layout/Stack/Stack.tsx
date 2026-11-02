import clsx from "clsx";
import { Flex, type FlexElement, type FlexProps } from "../Flex/Flex";
import { withLayoutDefault } from "../Flex/Flex.utils";

/** Native element attributes and responsive layout controls for Stack. */
export type StackProps<T extends FlexElement = "div"> = FlexProps<T>;

/** A vertical flex container with four spacing units between children by default. */
export function Stack<T extends FlexElement = "div">(props: StackProps<T>) {
  return (
    <Flex<T>
      {...props}
      direction={withLayoutDefault(props.direction, "column")}
      gap={withLayoutDefault(props.gap, 4)}
      className={clsx("lago-stack", props.className)}
    />
  );
}
