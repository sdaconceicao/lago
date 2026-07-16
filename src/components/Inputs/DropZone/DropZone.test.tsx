import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropZone, Text } from "./DropZone";

const createDataTransfer = (text: string) => ({
  types: ["text/plain"],
  effectAllowed: "all",
  dropEffect: "none",
  items: [{ kind: "string", type: "text/plain" }],
  files: [],
  getData: (type: string) => (type === "text/plain" ? text : ""),
});

const renderDropZone = (props = {}) =>
  render(
    <DropZone {...props}>
      <Text slot="label">Drag and drop files here</Text>
    </DropZone>
  );

describe("DropZone", () => {
  it("renders its children with the default class name", () => {
    const { container } = renderDropZone();

    const dropzone = container.querySelector(".react-aria-DropZone");
    expect(dropzone).not.toBeNull();
    expect(screen.getByText("Drag and drop files here")).toBeInTheDocument();
  });

  it("labels the hidden drop button with the label text", () => {
    renderDropZone();

    expect(
      screen.getByRole("button", { name: /Drag and drop files here/ })
    ).toBeInTheDocument();
  });

  it("marks the drop zone as focused when focused via keyboard", async () => {
    const user = userEvent.setup();
    const { container } = renderDropZone();

    const dropzone = container.querySelector(".react-aria-DropZone");
    expect(dropzone).not.toHaveAttribute("data-focused");

    await user.tab();

    expect(screen.getByRole("button")).toHaveFocus();
    expect(dropzone).toHaveAttribute("data-focused", "true");
  });

  it("sets data-drop-target while dragging over and clears it on leave", () => {
    const { container } = renderDropZone();
    const dropzone = container.querySelector(
      ".react-aria-DropZone"
    ) as HTMLElement;
    const dataTransfer = createDataTransfer("hello");

    fireEvent.dragEnter(dropzone, { dataTransfer });
    expect(dropzone).toHaveAttribute("data-drop-target", "true");

    fireEvent.dragLeave(dropzone, { dataTransfer });
    expect(dropzone).not.toHaveAttribute("data-drop-target");
  });

  it("calls onDrop with the dropped text items", async () => {
    const onDrop = vi.fn();
    const { container } = renderDropZone({ onDrop });
    const dropzone = container.querySelector(
      ".react-aria-DropZone"
    ) as HTMLElement;
    const dataTransfer = createDataTransfer("hello");

    fireEvent.dragEnter(dropzone, { dataTransfer });
    fireEvent.drop(dropzone, { dataTransfer });

    await waitFor(() => expect(onDrop).toHaveBeenCalledTimes(1));

    const event = onDrop.mock.calls[0][0];
    expect(event.type).toBe("drop");
    expect(event.items).toHaveLength(1);
    expect(event.items[0].kind).toBe("text");
    await expect(event.items[0].getText("text/plain")).resolves.toBe("hello");
  });

  it("calls onDrop when content is pasted while focused", async () => {
    const user = userEvent.setup();
    const onDrop = vi.fn();
    renderDropZone({ onDrop });

    await user.tab();
    fireEvent.paste(document.activeElement as HTMLElement, {
      clipboardData: createDataTransfer("pasted text"),
    });

    await waitFor(() => expect(onDrop).toHaveBeenCalledTimes(1));

    const event = onDrop.mock.calls[0][0];
    expect(event.type).toBe("drop");
    await expect(event.items[0].getText("text/plain")).resolves.toBe(
      "pasted text"
    );
  });

  it("marks the drop zone as disabled when isDisabled", () => {
    const { container } = renderDropZone({ isDisabled: true });

    const dropzone = container.querySelector(".react-aria-DropZone");
    expect(dropzone).toHaveAttribute("data-disabled", "true");
  });
});
