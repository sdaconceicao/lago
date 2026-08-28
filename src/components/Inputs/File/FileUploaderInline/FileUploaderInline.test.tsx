import { fireEvent, render, screen } from "@testing-library/react";
import type { FileUploadItem } from "../FileUploader/FileUploader";
import { FileUploaderInline } from "./FileUploaderInline";

const createImageFile = (name = "photo.png") =>
  new File(["image-bytes"], name, { type: "image/png" });

function createFileUploadItem(): FileUploadItem {
  return {
    id: "photo-1",
    file: createImageFile(),
    previewUrl: "blob:preview",
  };
}

describe("FileUploaderInline", () => {
  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the label, hint, and drop zone instructions", () => {
    render(<FileUploaderInline label="Attachment" hint="PNG or JPEG only" />);

    expect(screen.getByText("Attachment")).toBeInTheDocument();
    expect(screen.getByText("PNG or JPEG only")).toBeInTheDocument();
    expect(screen.getByText(/Click to upload/)).toBeInTheDocument();
    expect(screen.getByText(/or drag and drop/)).toBeInTheDocument();
  });

  it("names the drop zone with the visible label", () => {
    render(<FileUploaderInline label="Attachment" />);

    const label = screen.getByText("Attachment");
    const dropButton = screen.getByRole("button", { name: /attachment/i });

    expect(dropButton.getAttribute("aria-labelledby")).toContain(label.id);
  });

  it("labels the drop zone with the upload instructions when there is no field label", () => {
    render(<FileUploaderInline />);

    expect(
      screen.getByRole("button", { name: /click to upload or drag and drop/i })
    ).toBeInTheDocument();
  });

  it("associates the description with the field", () => {
    render(
      <FileUploaderInline
        label="Attachment"
        description="We never share them"
      />
    );

    const description = screen.getByText("We never share them");
    expect(screen.getByRole("group")).toHaveAttribute(
      "aria-describedby",
      description.id
    );
  });

  it("shows the error message when invalid", () => {
    render(
      <FileUploaderInline
        label="Attachment"
        isInvalid
        errorMessage="A file is required"
      />
    );

    expect(screen.getByText("A file is required")).toBeInTheDocument();
  });

  it('renders data-field-size="md" by default', () => {
    const { container } = render(<FileUploaderInline label="Attachment" />);

    expect(
      container.querySelector(".react-aria-FileUploaderInline")
    ).toHaveAttribute("data-field-size", "md");
  });

  it("shows a progress bar when the caller supplies upload progress", () => {
    render(
      <FileUploaderInline
        defaultValue={[
          {
            id: "photo-1",
            file: createImageFile(),
            status: "uploading",
            progress: 50,
          },
        ]}
      />
    );

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "50"
    );
  });

  it("shows the selected file as a chip inside the drop zone", () => {
    render(<FileUploaderInline defaultValue={[createFileUploadItem()]} />);

    expect(screen.getByText("photo.png")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove photo.png" })
    ).toBeInTheDocument();
    expect(screen.queryByText(/Click to upload/)).not.toBeInTheDocument();
    expect(screen.queryByText(/or drag and drop/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Add files" })
    ).not.toBeInTheDocument();
  });

  it("shows an Add control when multiple files are allowed and one is selected", () => {
    render(
      <FileUploaderInline
        allowsMultiple
        defaultValue={[createFileUploadItem()]}
      />
    );

    expect(screen.getByRole("link", { name: "Add files" })).toBeInTheDocument();
  });

  it("adds files from the hidden file input", () => {
    const onChange = vi.fn();
    const { container } = render(<FileUploaderInline onChange={onChange} />);
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

  it("marks the field disabled", () => {
    const { container } = render(
      <FileUploaderInline label="Attachment" isDisabled />
    );

    expect(
      container.querySelector(".react-aria-FileUploaderInline")
    ).toHaveAttribute("data-disabled", "true");
  });

  it("marks a required label", () => {
    render(<FileUploaderInline label="Attachment" isRequired />);

    expect(screen.getByText("Attachment")).toHaveAttribute(
      "data-required",
      "true"
    );
  });
});
