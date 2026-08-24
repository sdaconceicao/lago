"use client";
import {
  CircleAlert,
  CircleCheck,
  Info,
  Megaphone,
  TriangleAlert,
} from "lucide-react";
import type { ReactNode } from "react";

/**
 * Semantic tone of a feedback surface. Drives its colours and default icon.
 *
 * `default` carries no hue — it takes the library's own surface and text
 * tokens, so it reads as white on a light page and a raised grey on a dark one.
 * Reach for one of the four hues only when the message genuinely reports a
 * status.
 *
 * Shared by `Alert` and `Toast`, which are required to stay visually in step:
 * the vocabulary and the icon for each tone have one definition here, and the
 * colour and gutter scales derived from a tone have one definition in the
 * `feedbackSurface` treatment in `src/styles/base.module.css`. A surface that
 * defined its own copy of either would be free to drift from the other.
 */
export type FeedbackVariant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "error";

/** The icon each variant falls back to when the consumer does not supply one. */
export const VARIANT_ICONS: Record<FeedbackVariant, ReactNode> = {
  // The default surface announces rather than reports, so it gets its own glyph
  // instead of borrowing the `info` one — otherwise the two would be told apart
  // by colour alone, which is the one cue a grey surface has given up.
  default: <Megaphone size={20} aria-hidden="true" />,
  info: <Info size={20} aria-hidden="true" />,
  success: <CircleCheck size={20} aria-hidden="true" />,
  warning: <TriangleAlert size={20} aria-hidden="true" />,
  error: <CircleAlert size={20} aria-hidden="true" />,
};
