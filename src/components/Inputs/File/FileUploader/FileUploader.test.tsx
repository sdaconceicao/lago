import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUploader, type FileUploadItem } from "./FileUploader";

const createImageFile = (name = "photo.png") =>
  new File(["image-bytes"], name, { type: "image/png" });

const createPdfFile = (name = "invoice.pdf") =>
  new File(["pdf-bytes"], name, { type: "application/pdf" });

describe("FileUploader", () => {
  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the label, hint, and drop zone instructions", () => {
    render(<FileUploader label="Attachments" hint="PNG or JPEG only" />);

    expect(screen.getByText("Attachments")).toBeInTheDocument();
    expect(screen.getByText("PNG or JPEG only")).toBeInTheDocument();
    expect(screen.getByText(/Click to upload/)).toBeInTheDocument();
    expect(screen.getByText(/or drag and drop/)).toBeInTheDocument();
  });

  it("names the drop zone with the visible label", () => {
    render(<FileUploader label="Attachments" />);

    const label = screen.getByText("Attachments");
    const dropButton = screen.getByRole("button", { name: /attachments/i });

    expect(dropButton.getAttribute("aria-labelledby")).toContain(label.id);
  });

  it("labels the drop zone with the upload instructions when there is no field label", () => {
    render(<FileUploader />);

    expect(
      screen.getByRole("button", { name: /click to upload or drag and drop/i })
    ).toBeInTheDocument();
  });

  it("associates the description with the field", () => {
    render(
      <FileUploader label="Attachments" description="We never share them" />
    );

    const description = screen.getByText("We never share them");
    expect(screen.getByRole("group")).toHaveAttribute(
      "aria-describedby",
      description.id
    );
  });

  it("associates the hint with the field", () => {
    render(<FileUploader label="Attachments" hint="PNG or JPEG only" />);

    const hint = screen.getByText("PNG or JPEG only");
    expect(screen.getByRole("group")).toHaveAttribute(
      "aria-describedby",
      hint.id
    );
  });

  it("shows the error message when invalid", () => {
    render(
      <FileUploader
        label="Attachments"
        isInvalid
        errorMessage="A file is required"
      />
    );

    expect(screen.getByText("A file is required")).toBeInTheDocument();
  });

  it("does not render the error message when valid", () => {
    render(
      <FileUploader label="Attachments" errorMessage="A file is required" />
    );

    expect(screen.queryByText("A file is required")).not.toBeInTheDocument();
  });

  it('renders data-field-size="md" by default', () => {
    const { container } = render(<FileUploader label="Attachments" />);

    expect(container.querySelector(".react-aria-FileUploader")).toHaveAttribute(
      "data-field-size",
      "md"
    );
  });

  it("adds files from the hidden file input", () => {
    const onChange = vi.fn();
    const { container } = render(<FileUploader onChange={onChange} />);
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [createImageFile()] },
    });

    expect(onChange).toHaveBeenCalledTimes(1);

    const items = onChange.mock.calls[0][0] as FileUploadItem[];
    expect(items).toHaveLength(1);
    expect(items[0].file.name).toBe("photo.png");
    expect(screen.getByText("photo.png")).toBeInTheDocument();
  });

  it("shows an image preview for image files", () => {
    const { container } = render(
      <FileUploader defaultValue={[createFileUploadItemFromFile()]} />
    );

    expect(
      container.querySelector('img[src="blob:preview"]')
    ).toBeInTheDocument();
  });

  it("shows a file icon for non-image files", () => {
    const { container } = render(
      <FileUploader
        defaultValue={[
          {
            id: "pdf-1",
            file: createPdfFile(),
          },
        ]}
      />
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByText("invoice.pdf")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  it("removes a file when the remove button is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onRemove = vi.fn();

    render(
      <FileUploader
        defaultValue={[createFileUploadItemFromFile()]}
        onChange={onChange}
        onRemove={onRemove}
      />
    );

    await user.click(screen.getByRole("button", { name: "Remove photo.png" }));

    expect(onChange).toHaveBeenCalledWith([]);
    expect(onRemove).toHaveBeenCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ name: "photo.png" }),
      })
    );
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it("revokes a preview URL the uploader created when the file is removed", async () => {
    const user = userEvent.setup();
    const { container } = render(<FileUploader />);
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [createImageFile()] },
    });

    await user.click(screen.getByRole("button", { name: "Remove photo.png" }));

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("revokes preview URLs when a controlled value drops an item", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <FileUploader value={[]} onChange={onChange} />
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [createImageFile()] },
    });

    const added = onChange.mock.calls[0][0] as FileUploadItem[];
    rerender(<FileUploader value={added} onChange={onChange} />);
    rerender(<FileUploader value={[]} onChange={onChange} />);

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("replaces the selected file when allowsMultiple is false", () => {
    const onChange = vi.fn();
    const { container } = render(
      <FileUploader allowsMultiple={false} onChange={onChange} />
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [createImageFile("one.png")] },
    });
    fireEvent.change(input, {
      target: { files: [createImageFile("two.png")] },
    });

    expect(onChange).toHaveBeenCalledTimes(2);
    const last = onChange.mock.calls[1][0] as FileUploadItem[];
    expect(last).toHaveLength(1);
    expect(last[0].file.name).toBe("two.png");
  });

  it("reports files over maxSize through onReject", () => {
    const onChange = vi.fn();
    const onReject = vi.fn();
    const { container } = render(
      <FileUploader maxSize={4} onChange={onChange} onReject={onReject} />
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const tooLarge = new File(["too-large"], "big.png", { type: "image/png" });

    fireEvent.change(input, {
      target: { files: [tooLarge] },
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith([tooLarge], "maxSize");
    expect(screen.queryByText("big.png")).not.toBeInTheDocument();
  });

  it("reports files that fail accept through onReject", () => {
    const onChange = vi.fn();
    const onReject = vi.fn();
    const { container } = render(
      <FileUploader
        accept="image/png"
        onChange={onChange}
        onReject={onReject}
      />
    );
    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const pdf = createPdfFile();

    fireEvent.change(input, {
      target: { files: [pdf] },
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith([pdf], "accept");
  });

  it("renders upload progress when provided by the caller", () => {
    render(
      <FileUploader
        defaultValue={[
          {
            id: "uploading-1",
            file: createPdfFile(),
            status: "uploading",
            progress: 50,
          },
        ]}
      />
    );

    expect(screen.getByText("Uploading…")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "50"
    );
    expect(screen.getByRole("progressbar").firstElementChild).toHaveStyle({
      "--percent": "50%",
    });
  });

  it("renders a retry action for failed uploads", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <FileUploader
        onRetry={onRetry}
        defaultValue={[
          {
            id: "failed-1",
            file: createPdfFile(),
            status: "error",
            errorMessage: "Upload failed, please try again",
          },
        ]}
      />
    );

    await user.click(screen.getByRole("link", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledWith(
      expect.objectContaining({ id: "failed-1" })
    );
  });

  it("adds dropped files to the list", async () => {
    const onChange = vi.fn();
    const { container } = render(<FileUploader onChange={onChange} />);
    const dropzone = container.querySelector(
      ".react-aria-DropZone"
    ) as HTMLElement;
    const file = createPdfFile();
    const dataTransfer = {
      types: ["Files"],
      effectAllowed: "all",
      dropEffect: "copy",
      items: [
        {
          kind: "file",
          type: file.type,
          getAsFile: () => file,
        },
      ],
      files: [file],
      getData: () => "",
    };

    fireEvent.dragEnter(dropzone, { dataTransfer });
    fireEvent.drop(dropzone, { dataTransfer });

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange.mock.calls[0][0][0].file.name).toBe("invoice.pdf");
  });

  it("marks the drop zone as disabled", () => {
    const { container } = render(
      <FileUploader isDisabled label="Attachments" />
    );

    expect(container.querySelector(".react-aria-DropZone")).toHaveAttribute(
      "data-disabled",
      "true"
    );
  });

  it("renders the round variant on the root element", () => {
    const { container } = render(
      <FileUploader label="Attachments" variant="round" />
    );

    expect(container.firstElementChild).toHaveAttribute(
      "data-variant",
      "round"
    );
  });

  it("shows a single selected image inside the circular drop zone", () => {
    const { container } = render(
      <FileUploader
        variant="round"
        allowsMultiple={false}
        defaultValue={[createFileUploadItemFromFile()]}
      />
    );

    expect(
      container.querySelector('img[src="blob:preview"]')
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove photo.png" })
    ).toBeInTheDocument();
    expect(screen.queryByText("photo.png")).not.toBeInTheDocument();
  });
});

function createFileUploadItemFromFile(): FileUploadItem {
  return {
    id: "photo-1",
    file: createImageFile(),
    previewUrl: "blob:preview",
  };
}
