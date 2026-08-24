"use client";
import { createContext, useContext } from "react";
import type { FeedbackVariant } from "../Feedback/Feedback.variants";

/**
 * Semantic tone of an alert. Drives its colours and default header icon.
 *
 * `default` is for the message that reports no status of its own and so carries
 * no hue. The other four each take one.
 *
 * An alias for the shared `FeedbackVariant`, which Toast uses too — the two
 * surfaces have to stay in step, so the vocabulary has one definition. Kept
 * under this name because it is part of the published API.
 */
export type AlertVariant = FeedbackVariant;

/**
 * Shape of an alert. `module` sits inside content as a rounded, self-contained
 * card; `fullWidth` spans its container edge to edge as a page-level band.
 */
export type AlertType = "module" | "fullWidth";

/**
 * Carries the variant from `Alert` down to `Alert.Header` so the header can
 * pick a matching default icon without the variant being threaded through by
 * hand. A header rendered on its own, outside an `Alert`, falls back to the
 * same `default` variant the `Alert` itself uses.
 */
export const AlertVariantContext = createContext<AlertVariant>("default");

export const useAlertVariant = () => useContext(AlertVariantContext);
