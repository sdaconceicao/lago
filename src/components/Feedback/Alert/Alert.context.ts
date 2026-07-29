"use client";
import { createContext, useContext } from "react";

/**
 * Semantic tone of an alert. Drives its colours and default header icon.
 *
 * `default` is for the message that reports no status of its own and so carries
 * no hue. The other four each take one.
 */
export type AlertVariant = "default" | "info" | "success" | "warning" | "error";

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
