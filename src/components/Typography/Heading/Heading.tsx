import clsx from "clsx";
import type { ComponentPropsWithRef } from "react";
import styles from "./Heading.module.css";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface HeadingProps
  extends Omit<ComponentPropsWithRef<"h1">, "slot"> {
  /**
   * Which heading element to render. Defaults to 3, matching react-aria's own
   * default. Typed as `number` for the same reason; anything outside 1–6 falls
   * back to 3 rather than emitting an `<h7>`.
   */
  level?: number;
  /**
   * Forwarded to the DOM as-is. `slot` only *means* something to
   * `SlottedHeading`, which resolves it against the surrounding container; it is
   * accepted here so the two components take the same props. `null` is
   * react-aria's way of opting out of an ancestor's slot, hence the wider type.
   */
  slot?: string | null;
}

/**
 * A heading with Lago's type styles, and deliberately nothing else.
 *
 * **Renders on the server.** It is a plain `h1`–`h6`: no hooks, no context, no
 * react-aria import, so it carries no `"use client"` directive and a React
 * Server Component can render it without pulling a client boundary — and
 * everything behind it — into the bundle.
 *
 * If the heading sits inside a container that names it through a slot, such as
 * `slot="title"` in a Dialog, reach for `SlottedHeading` instead: it resolves
 * the slot and renders this one underneath.
 */
export function Heading({
  level = 3,
  className,
  slot,
  ...props
}: HeadingProps) {
  const Element: HeadingTag =
    level >= 1 && level <= 6 ? (`h${Math.trunc(level)}` as HeadingTag) : "h3";

  return (
    <Element
      {...props}
      // `null` means "no slot" to react-aria; the DOM wants it simply absent.
      slot={slot ?? undefined}
      className={clsx("react-aria-Heading", styles.heading, className)}
    />
  );
}
