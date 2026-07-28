/**
 * The size scale shared by every field-like input.
 *
 * Components accept this as a `size` prop and render it as a
 * `data-field-size` attribute on their root element. The attribute scopes the
 * `--field-*` custom properties defined in `styles/theme.css`, which are
 * inherited by every descendant — so nested base components pick up the right
 * metrics without prop drilling.
 *
 * - `"md"` — the default. Field height 48px, 8px radius, 14px text.
 * - `"sm"` — compact. Field height 28px, 6px radius, 12px text.
 *
 * Controls at the same size share their outer height, border radius,
 * horizontal padding, and font size, so they line up when placed in a row.
 */
export type FieldSize = "sm" | "md";

/** The size every field renders at when no `size` prop is passed. */
export const DEFAULT_FIELD_SIZE: FieldSize = "md";
