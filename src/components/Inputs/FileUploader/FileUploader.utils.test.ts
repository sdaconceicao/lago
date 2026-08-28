import {
  createFileUploadItem,
  fileMatchesAccept,
  fileMatchesMaxSize,
  filterAcceptedFiles,
  formatFileSize,
  isImageFile,
  parseAcceptedFileTypes,
  revokePreviewUrls,
} from "./FileUploader.utils";

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(720 * 1024)).toBe("720 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });
});

describe("isImageFile", () => {
  it("returns true for image mime types", () => {
    expect(isImageFile({ type: "image/png" } as File)).toBe(true);
  });

  it("returns false for non-image mime types", () => {
    expect(isImageFile({ type: "application/pdf" } as File)).toBe(false);
  });
});

describe("parseAcceptedFileTypes", () => {
  it("returns undefined when accept is empty", () => {
    expect(parseAcceptedFileTypes()).toBeUndefined();
    expect(parseAcceptedFileTypes("")).toBeUndefined();
  });

  it("splits comma-separated accept values", () => {
    expect(parseAcceptedFileTypes("image/png, .pdf")).toEqual([
      "image/png",
      ".pdf",
    ]);
  });
});

describe("fileMatchesAccept", () => {
  const pngFile = { name: "photo.png", type: "image/png" } as File;
  const pdfFile = { name: "invoice.pdf", type: "application/pdf" } as File;

  it("accepts all files when accept is not set", () => {
    expect(fileMatchesAccept(pngFile)).toBe(true);
    expect(fileMatchesAccept(pdfFile)).toBe(true);
  });

  it("matches mime types and extensions", () => {
    expect(fileMatchesAccept(pngFile, "image/png")).toBe(true);
    expect(fileMatchesAccept(pdfFile, ".pdf")).toBe(true);
    expect(fileMatchesAccept(pngFile, "image/*")).toBe(true);
    expect(fileMatchesAccept(pdfFile, "image/*")).toBe(false);
  });
});

describe("fileMatchesMaxSize", () => {
  const file = { size: 1024 } as File;

  it("accepts any size when maxSize is not set", () => {
    expect(fileMatchesMaxSize(file)).toBe(true);
  });

  it("rejects files over the limit", () => {
    expect(fileMatchesMaxSize(file, 512)).toBe(false);
    expect(fileMatchesMaxSize(file, 1024)).toBe(true);
  });
});

describe("createFileUploadItem", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates preview URLs for image files", () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:preview");
    const file = {
      name: "photo.png",
      type: "image/png",
      lastModified: 1,
    } as File;

    expect(createFileUploadItem(file)).toEqual(
      expect.objectContaining({
        file,
        previewUrl: "blob:preview",
        status: "idle",
      })
    );

    createObjectURL.mockRestore();
  });

  it("does not create preview URLs for non-image files", () => {
    const createObjectURL = vi.spyOn(URL, "createObjectURL");
    const file = {
      name: "invoice.pdf",
      type: "application/pdf",
      lastModified: 1,
    } as File;

    expect(createFileUploadItem(file).previewUrl).toBeUndefined();
    expect(createObjectURL).not.toHaveBeenCalled();

    createObjectURL.mockRestore();
  });
});

describe("filterAcceptedFiles", () => {
  const pngFile = { name: "photo.png", type: "image/png", size: 100 } as File;
  const pdfFile = {
    name: "invoice.pdf",
    type: "application/pdf",
    size: 100,
  } as File;

  it("filters by accept and max size", () => {
    expect(filterAcceptedFiles([pngFile, pdfFile], "image/png", 50)).toEqual(
      []
    );
    expect(filterAcceptedFiles([pngFile, pdfFile], "image/png", 200)).toEqual([
      pngFile,
    ]);
  });
});

describe("revokePreviewUrls", () => {
  it("revokes preview URLs on items", () => {
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});

    revokePreviewUrls([
      { id: "1", file: {} as File, previewUrl: "blob:one" },
      { id: "2", file: {} as File },
    ]);

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:one");
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);

    revokeObjectURL.mockRestore();
  });
});
