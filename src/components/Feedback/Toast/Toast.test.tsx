import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastArea, ToastQueue } from "./Toast";

const closeAllToasts = () => {
  act(() => {
    for (const toast of [...ToastQueue.visibleToasts]) {
      ToastQueue.close(toast.key);
    }
  });
};

describe("Toast", () => {
  afterEach(() => {
    closeAllToasts();
  });

  it("renders no region while the ToastQueue is empty", () => {
    render(<ToastArea />);

    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("displays a toast when content is added to the ToastQueue", () => {
    render(<ToastArea />);

    act(() => {
      ToastQueue.add({ title: "Files uploaded" });
    });

    expect(screen.getByRole("region")).toBeInTheDocument();
    const toast = screen.getByRole("alertdialog");
    expect(toast).toHaveAccessibleName("Files uploaded");
  });

  it("renders the optional description", () => {
    render(<ToastArea />);

    act(() => {
      ToastQueue.add({
        title: "Files uploaded",
        description: "3 files uploaded successfully.",
      });
    });

    expect(
      screen.getByText("3 files uploaded successfully.")
    ).toBeInTheDocument();
  });

  it("omits the description element when not provided", () => {
    render(<ToastArea />);

    act(() => {
      ToastQueue.add({ title: "Saved" });
    });

    const toast = screen.getByRole("alertdialog");
    expect(within(toast).queryByText(/successfully/)).not.toBeInTheDocument();
    expect(toast).toHaveTextContent("Saved");
  });

  it("marks a toast with the default variant when none is given", () => {
    render(<ToastArea />);

    act(() => {
      ToastQueue.add({ title: "Saved" });
    });

    expect(screen.getByRole("alertdialog")).toHaveAttribute(
      "data-variant",
      "default"
    );
  });

  it("carries the variant from the queued content onto the toast", () => {
    render(<ToastArea />);

    act(() => {
      ToastQueue.add({ title: "Upload failed", variant: "error" });
    });

    expect(screen.getByRole("alertdialog")).toHaveAttribute(
      "data-variant",
      "error"
    );
  });

  it("renders a distinct icon per variant, so the tone never rests on colour alone", () => {
    const icons = (
      ["default", "info", "success", "warning", "error"] as const
    ).map((variant) => {
      const { unmount } = render(<ToastArea />);
      act(() => {
        ToastQueue.add({ title: "Title", variant });
      });
      const markup =
        screen.getByRole("alertdialog").querySelector(".toast-icon")
          ?.innerHTML ?? "";
      closeAllToasts();
      unmount();
      return markup;
    });

    expect(icons.every(Boolean)).toBe(true);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it("hides the variant icon from assistive technology, which has the title", () => {
    render(<ToastArea />);

    act(() => {
      ToastQueue.add({ title: "Upload failed", variant: "error" });
    });

    expect(
      screen.getByRole("alertdialog").querySelector(".toast-icon svg")
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("dismisses a toast via its close button", async () => {
    const user = userEvent.setup();
    render(<ToastArea />);

    act(() => {
      ToastQueue.add({ title: "Dismissible toast" });
    });

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("shows multiple queued toasts", () => {
    render(<ToastArea />);

    act(() => {
      ToastQueue.add({ title: "First toast" });
      ToastQueue.add({ title: "Second toast" });
    });

    const toasts = screen.getAllByRole("alertdialog");
    expect(toasts).toHaveLength(2);
    expect(screen.getByText("First toast")).toBeInTheDocument();
    expect(screen.getByText("Second toast")).toBeInTheDocument();
  });

  it("removes a toast when closed programmatically", () => {
    render(<ToastArea />);

    let key = "";
    act(() => {
      key = ToastQueue.add({ title: "Programmatic toast" });
    });

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    act(() => {
      ToastQueue.close(key);
    });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
