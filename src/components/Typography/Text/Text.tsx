import clsx from "clsx";
import type { ComponentPropsWithRef, ElementType } from "react";

export interface TextProps extends Omit<ComponentPropsWithRef<"span">, "slot"> {
  /**
   * The element to render. Defaults to `span`, matching react-aria — and typed
   * as loosely as react-aria types it, so the two are interchangeable.
   */
  elementType?: string;
  /**
   * Forwarded to the DOM as-is. It only *means* something to `SlottedText`,
   * which resolves it against the surrounding container; accepted here so the
   * two take the same props. `null` is react-aria's opt-out of an ancestor's
   * slot.
   */
  slot?: string | null;
}

/**
 * A run of text carrying Lago's `react-aria-Text` class, and nothing else.
 *
 * **Renders on the server**: no hooks, no context, no react-aria import, so no
 * `"use client"` directive — see `Heading` for why that matters.
 *
 * Where the text is claimed by a container — `slot="description"` on a field,
 * for one — reach for `SlottedText`, which resolves the slot and renders this
 * one underneath.
 */
export function Text({
  elementType = "span",
  className,
  slot,
  ...props
}: TextProps) {
  const Element = elementType as ElementType;

  return (
    <Element
      {...props}
      // `null` means "no slot" to react-aria; the DOM wants it simply absent.
      slot={slot ?? undefined}
      className={clsx("react-aria-Text", className)}
    />
  );
}
