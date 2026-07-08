"use client";
import { type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { X } from "lucide-react";
import {
  Text,
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  type ToastProps,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as ToastRegion,
} from "react-aria-components/Toast";
import { Button } from "../Button/Button";
import "./Toast.css";

// Define the type for your toast content. This interface defines the properties of your toast content, affecting what you
// pass to the queue calls as arguments.
interface MyToastContent {
  title: string;
  description?: string;
}

// This is a global toast queue, to be imported and called where ever you want to queue a toast via queue.add().
export const queue = new ToastQueue<MyToastContent>({
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

export function MyToastRegion() {
  return (
    // The ToastRegion should be rendered at the root of your app.
    <ToastRegion queue={queue}>
      {({ toast }) => (
        <MyToast
          toast={toast}
          style={{ viewTransitionName: toast.key } as CSSProperties}
        >
          <ToastContent>
            <Text slot="title">{toast.content.title}</Text>
            {toast.content.description && (
              <Text slot="description">{toast.content.description}</Text>
            )}
          </ToastContent>
          <Button slot="close" aria-label="Close" variant="quiet">
            <X size={16} />
          </Button>
        </MyToast>
      )}
    </ToastRegion>
  );
}

export function MyToast(props: ToastProps<MyToastContent>) {
  return <Toast {...props} />;
}
