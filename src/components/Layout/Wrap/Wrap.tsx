import clsx from "clsx";
import type { FlexElement } from "../Flex/Flex";
import { withLayoutDefault } from "../Flex/Flex.utils";
import { HStack, type HStackProps } from "../HStack/HStack";

/** Native element attributes and responsive layout controls for Wrap. */
export type WrapProps<T extends FlexElement = "div"> = HStackProps<T>;

/** A horizontal stack that wraps children onto additional lines by default. */
export function Wrap<T extends FlexElement = "div">(props: WrapProps<T>) {
  return (
    <HStack<T>
      {...props}
      wrap={withLayoutDefault(props.wrap, "wrap")}
      className={clsx("lago-wrap", props.className)}
    />
  );
}
