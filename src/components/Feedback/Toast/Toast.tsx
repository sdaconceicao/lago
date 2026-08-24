"use client";
import clsx from "clsx";
import { X } from "lucide-react";
import type { CSSProperties } from "react";
import {
  UNSTABLE_Toast as RACToast,
  UNSTABLE_ToastContent as RACToastContent,
  type ToastProps as RACToastProps,
  UNSTABLE_ToastQueue as RACToastQueue,
  UNSTABLE_ToastRegion as RACToastRegion,
  Text,
} from "react-aria-components/Toast";
import { flushSync } from "react-dom";
import { IconButton } from "@/components/Actions/IconButton/IconButton";
import {
  type FeedbackVariant,
  VARIANT_ICONS,
} from "@/components/Feedback/Feedback/Feedback.variants";
import base from "@/styles/base.module.css";
import styles from "./Toast.module.css";

/**
 * What a queued toast carries. `ToastQueue` is typed by this, so everything a
 * toast needs to render is passed to `ToastQueue.add()` — there is no second
 * place to put it.
 */
export interface ToastContent {
  title: string;
  description?: string;
  /**
   * The semantic tone of the toast. Sets the surface, border, icon and text
   * colours, and the icon in the leading gutter — the same tones and glyphs
   * `Alert` uses, so the two read as one family.
   *
   * `default` carries no hue. Reach for one of the four others only when the
   * toast genuinely reports a status.
   *
   * It lives on the content rather than among `ToastQueue.add`'s options
   * because the queue is typed by its content — so it is passed as
   * `ToastQueue.add({ title: 'Upload failed', variant: 'error' })`.
   *
   * @default 'default'
   */
  variant?: FeedbackVariant;
}

export type ToastProps = RACToastProps<ToastContent>;

/**
 * The queue every toast goes through. Import it wherever a toast should be
 * raised and call `ToastQueue.add()`; `ToastArea` renders whatever is in it.
 */
export const ToastQueue = new RACToastQueue<ToastContent>({
  // Wrap state updates in a CSS view transition.
  wrapUpdate(fn) {
    if ("startViewTransition" in document) {
      document.startViewTransition(() => {
        flushSync(fn);
      });
    } else {
      fn();
    }
  },
});

/**
 * The region the queue's toasts are rendered into. Render it once, at the root
 * of the app.
 */
export function ToastArea() {
  return (
    <RACToastRegion
      queue={ToastQueue}
      className={clsx("react-aria-ToastRegion", styles.toastRegion)}
    >
      {({ toast }) => (
        <Toast
          toast={toast}
          style={{ viewTransitionName: toast.key } as CSSProperties}
        >
          {/* The variant is never carried by colour alone — the glyph says the
              same thing for anyone who cannot use the hue, which is also why
              `default` gets its own icon rather than borrowing `info`'s. */}
          <span className={clsx("toast-icon", styles.toastIcon)}>
            {VARIANT_ICONS[toast.content.variant ?? "default"]}
          </span>
          <RACToastContent
            className={clsx("react-aria-ToastContent", styles.toastContent)}
          >
            <Text slot="title">{toast.content.title}</Text>
            {toast.content.description && (
              <Text slot="description">{toast.content.description}</Text>
            )}
          </RACToastContent>
          {/* `sm`, matching Alert's dismiss control — and replacing the hand
              written 32px square the stylesheet used to force on it. */}
          <IconButton slot="close" aria-label="Close" variant="quiet" size="sm">
            <X size={16} />
          </IconButton>
        </Toast>
      )}
    </RACToastRegion>
  );
}

/**
 * A single toast. `ToastArea` renders one of these per queued item; reach for it
 * directly only when composing a region of your own.
 */
export function Toast(props: ToastProps) {
  return (
    <RACToast
      {...props}
      // Read by the shared `feedbackSurface` treatment, which owns the tone's
      // colours and gutter for both Toast and Alert.
      data-variant={props.toast.content.variant ?? "default"}
      className={clsx(
        "react-aria-Toast",
        styles.toast,
        base.feedbackSurface,
        props.className
      )}
    />
  );
}
