/**
 * The size scale shared by `Avatar` and `AvatarInitials`.
 *
 * Components accept this as a `size` prop and render it as a
 * `data-avatar-size` attribute on their root element, which scopes the
 * `--avatar-*` custom properties declared in `Avatar.module.css`. Because those
 * properties are inherited, an `AvatarInitials` nested inside an `Avatar` picks
 * up the frame's metrics without redeclaring the scale.
 *
 * - `"sm"` — 28px.
 * - `"md"` — the default. 36px.
 * - `"lg"` — 48px.
 *
 * The three steps match the Button and field heights of the same name, so an
 * avatar lines up with the controls beside it in a row.
 */
export type AvatarSize = "sm" | "md" | "lg";

/** The size an avatar renders at when no `size` prop is passed. */
export const DEFAULT_AVATAR_SIZE: AvatarSize = "md";

/**
 * The outline of an avatar. `circle` is the default; `square` is a rounded
 * rectangle sharing the field radius of the matching size, for places where an
 * avatar sits in a grid of other rectangular tiles.
 */
export type AvatarShape = "circle" | "square";

/** The shape an avatar renders as when no `shape` prop is passed. */
export const DEFAULT_AVATAR_SHAPE: AvatarShape = "circle";
