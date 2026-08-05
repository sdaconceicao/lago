/** The shape a skeleton is drawn as. */
export type SkeletonVariant = "box" | "circle" | "line";

/** The shape a skeleton renders as when no `variant` prop is passed. */
export const DEFAULT_SKELETON_VARIANT: SkeletonVariant = "box";

/** How a skeleton's corners are cut. */
export type SkeletonEdges = "round" | "straight";

/** The edges a skeleton renders with when no `edges` prop is passed. */
export const DEFAULT_SKELETON_EDGES: SkeletonEdges = "round";

/** A length accepted by the sizing props: a number of pixels, or any CSS length. */
export type SkeletonLength = number | string;

/** The number of lines a paragraph skeleton draws when no `lines` prop is passed. */
export const DEFAULT_PARAGRAPH_LINES = 3;
