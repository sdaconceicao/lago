import { act, render, screen } from "@testing-library/react";
import { Alert } from "./Alert/Alert";
import { type FeedbackVariant, VARIANT_ICONS } from "./Feedback.variants";
import { ToastArea, ToastQueue } from "./Toast/Toast";

const VARIANTS: FeedbackVariant[] = [
  "default",
  "info",
  "success",
  "warning",
  "error",
];

describe("feedback variants", () => {
  it("gives every variant an icon of its own", () => {
    const icons = VARIANTS.map((variant) => VARIANT_ICONS[variant]);

    expect(icons.every(Boolean)).toBe(true);
    expect(new Set(icons).size).toBe(icons.length);
  });

  // The reason the vocabulary and the icon map live here rather than inside
  // Alert: the two surfaces are required to read as one family, so a variant
  // picking up a different glyph in one of them is a defect. Nothing but a test
  // stops a later change from reintroducing a private copy.
  it.each(VARIANTS)(
    "renders the same %s glyph in Alert and Toast",
    (variant) => {
      const alert = render(
        <Alert variant={variant}>
          <Alert.Header title="Title" />
        </Alert>
      );
      const alertIcon =
        alert.container.querySelector(".alert-icon")?.innerHTML ?? "";
      alert.unmount();

      const toast = render(<ToastArea />);
      act(() => {
        ToastQueue.add({ title: "Title", variant });
      });
      const toastIcon =
        screen.getByRole("alertdialog").querySelector(".toast-icon")
          ?.innerHTML ?? "";
      act(() => {
        for (const queued of [...ToastQueue.visibleToasts]) {
          ToastQueue.close(queued.key);
        }
      });
      toast.unmount();

      expect(alertIcon).not.toBe("");
      expect(toastIcon).toBe(alertIcon);
    }
  );
});
