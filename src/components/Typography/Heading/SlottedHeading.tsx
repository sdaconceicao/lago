"use client";
import { HeadingContext } from "react-aria-components/Heading";
import { useContextProps } from "react-aria-components/slots";
import { Heading, type HeadingProps } from "./Heading";

/** Same props as `Heading`; `slot` is the one that gains meaning here. */
export type SlottedHeadingProps = HeadingProps;

/**
 * A heading that a surrounding container can claim through a slot —
 * `slot="title"` inside a Dialog becomes the dialog's accessible name.
 *
 * The rendering is entirely `Heading`'s; all this adds is the slot lookup. That
 * lookup is also the only reason this is a client component: reading
 * react-aria's `HeadingContext` needs `useContext`, and merely importing that
 * context rules out the server, because the module calls `createContext` at
 * module scope and React's server build does not implement it.
 *
 * So use plain `Heading` unless a container is naming this one.
 */
export function SlottedHeading({ ref, ...props }: SlottedHeadingProps) {
  const [contextProps, contextRef] = useContextProps(
    props,
    ref ?? null,
    HeadingContext
  );

  return <Heading {...contextProps} ref={contextRef} />;
}
