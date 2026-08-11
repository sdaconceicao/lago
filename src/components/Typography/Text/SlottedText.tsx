"use client";
import { useContextProps } from "react-aria-components/slots";
import { TextContext } from "react-aria-components/Text";
import { Text, type TextProps } from "./Text";

/** Same props as `Text`; `slot` is the one that gains meaning here. */
export type SlottedTextProps = TextProps;

/**
 * Text that a surrounding container can claim through a slot —
 * `slot="description"` on a field, `slot="label"` on a list option.
 *
 * The rendering is entirely `Text`'s; all this adds is the slot lookup, which is
 * also the only reason it is a client component. See `SlottedHeading` for the
 * full reasoning.
 *
 * So use plain `Text` unless a container is naming this one.
 */
export function SlottedText({ ref, ...props }: SlottedTextProps) {
  const [contextProps, contextRef] = useContextProps(
    props,
    ref ?? null,
    TextContext
  );

  return <Text {...contextProps} ref={contextRef} />;
}
