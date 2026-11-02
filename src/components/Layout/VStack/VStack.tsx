import clsx from "clsx";
import type { FlexElement } from "../Flex/Flex";
import { Stack, type StackProps } from "../Stack/Stack";

/** Native element attributes and responsive layout controls for VStack. */
export type VStackProps<T extends FlexElement = "div"> = StackProps<T>;

/** An explicitly named vertical stack with the same overridable defaults as Stack. */
export function VStack<T extends FlexElement = "div">(props: VStackProps<T>) {
  return (
    <Stack<T> {...props} className={clsx("lago-vstack", props.className)} />
  );
}
