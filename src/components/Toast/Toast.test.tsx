import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyToastRegion, queue } from "./Toast";

const closeAllToasts = () => {
  act(() => {
    for (const toast of [...queue.visibleToasts]) {
      queue.close(toast.key);
    }
  });
};

describe("Toast", () => {
  afterEach(() => {
    closeAllToasts();
  });

  it("renders no region while the queue is empty", () => {
    render(<MyToastRegion />);

    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("displays a toast when content is added to the queue", () => {
    render(<MyToastRegion />);

    act(() => {
      queue.add({ title: "Files uploaded" });
    });

    expect(screen.getByRole("region")).toBeInTheDocument();
    const toast = screen.getByRole("alertdialog");
    expect(toast).toHaveAccessibleName("Files uploaded");
  });

  it("renders the optional description", () => {
    render(<MyToastRegion />);

    act(() => {
      queue.add({
        title: "Files uploaded",
        description: "3 files uploaded successfully.",
      });
    });

    expect(
      screen.getByText("3 files uploaded successfully.")
    ).toBeInTheDocument();
  });

  it("omits the description element when not provided", () => {
    render(<MyToastRegion />);

    act(() => {
      queue.add({ title: "Saved" });
    });

    const toast = screen.getByRole("alertdialog");
    expect(within(toast).queryByText(/successfully/)).not.toBeInTheDocument();
    expect(toast).toHaveTextContent("Saved");
  });

  it("dismisses a toast via its close button", async () => {
    const user = userEvent.setup();
    render(<MyToastRegion />);

    act(() => {
      queue.add({ title: "Dismissible toast" });
    });

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("shows multiple queued toasts", () => {
    render(<MyToastRegion />);

    act(() => {
      queue.add({ title: "First toast" });
      queue.add({ title: "Second toast" });
    });

    const toasts = screen.getAllByRole("alertdialog");
    expect(toasts).toHaveLength(2);
    expect(screen.getByText("First toast")).toBeInTheDocument();
    expect(screen.getByText("Second toast")).toBeInTheDocument();
  });

  it("removes a toast when closed programmatically", () => {
    render(<MyToastRegion />);

    let key = "";
    act(() => {
      key = queue.add({ title: "Programmatic toast" });
    });

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    act(() => {
      queue.close(key);
    });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
