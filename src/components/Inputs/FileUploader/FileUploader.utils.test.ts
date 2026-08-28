import {
  createFileUploadItem,
  EMPTY_VALIDATION,
  type FileUploadItem,
  fileMatchesAccept,
  fileMatchesMaxSize,
  filterAcceptedFiles,
  formatFileSize,
  getCirclePreviewItem,
  getFieldValidation,
  getFilesFromDropEvent,
  getListItems,
  getProgressPercent,
  getStatusMessage,
  isImageFile,
  parseAcceptedFileTypes,
  partitionFiles,
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
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
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

describe("partitionFiles", () => {
  const pngFile = { name: "photo.png", type: "image/png", size: 100 } as File;
  const pdfFile = {
    name: "invoice.pdf",
    type: "application/pdf",
    size: 200,
  } as File;

  it("separates oversized files from type mismatches", () => {
    expect(partitionFiles([pngFile, pdfFile], "image/png", 150)).toEqual({
      accepted: [pngFile],
      rejectedByMaxSize: [pdfFile],
      rejectedByAccept: [],
    });
    expect(partitionFiles([pngFile, pdfFile], "image/png", 200)).toEqual({
      accepted: [pngFile],
      rejectedByMaxSize: [],
      rejectedByAccept: [pdfFile],
    });
  });
});

describe("getFilesFromDropEvent", () => {
  it("reads file drop items and skips others", async () => {
    const file = new File(["pdf-bytes"], "invoice.pdf", {
      type: "application/pdf",
    });

    const files = await getFilesFromDropEvent({
      items: [
        {
          kind: "file",
          type: file.type,
          name: file.name,
          getFile: async () => file,
          getText: async () => "",
        },
        {
          kind: "text",
          types: new Set(["text/plain"]),
          getText: async () => "",
        },
      ],
    });

    expect(files).toEqual([file]);
  });
});

describe("revokePreviewUrls", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
  });
});

describe("getStatusMessage", () => {
  const file = { name: "photo.png" } as File;

  it("returns uploading, complete, and idle copy", () => {
    expect(getStatusMessage({ id: "1", file, status: "uploading" })).toBe(
      "Uploading…"
    );
    expect(getStatusMessage({ id: "1", file, status: "complete" })).toBe(
      "Complete"
    );
    expect(getStatusMessage({ id: "1", file })).toBe("");
  });

  it("returns the item error message, falling back when it is missing", () => {
    expect(
      getStatusMessage({
        id: "1",
        file,
        status: "error",
        errorMessage: "Too large",
      })
    ).toBe("Too large");
    expect(getStatusMessage({ id: "1", file, status: "error" })).toBe(
      "Upload failed"
    );
  });
});

describe("getProgressPercent", () => {
  const file = { name: "photo.png" } as File;

  it("clamps progress to 0–100", () => {
    expect(getProgressPercent({ id: "1", file, progress: -10 })).toBe(0);
    expect(getProgressPercent({ id: "1", file, progress: 50 })).toBe(50);
    expect(getProgressPercent({ id: "1", file, progress: 150 })).toBe(100);
  });

  it("treats a complete item with no progress as 100", () => {
    expect(getProgressPercent({ id: "1", file, status: "complete" })).toBe(100);
    expect(
      getProgressPercent({ id: "1", file, status: "complete", progress: 80 })
    ).toBe(80);
  });
});

describe("getCirclePreviewItem", () => {
  const imageItem: FileUploadItem = {
    id: "photo-1",
    file: { name: "photo.png", type: "image/png" } as File,
    previewUrl: "blob:preview",
  };

  it("returns the single image on a round, single-file uploader", () => {
    expect(getCirclePreviewItem("round", [imageItem], false)).toBe(imageItem);
  });

  it("returns undefined when the variant, count, or file cannot fill the circle", () => {
    expect(getCirclePreviewItem("default", [imageItem], false)).toBeUndefined();
    expect(getCirclePreviewItem("round", [imageItem], true)).toBeUndefined();
    expect(getCirclePreviewItem("round", [], false)).toBeUndefined();
    expect(
      getCirclePreviewItem(
        "round",
        [imageItem, { ...imageItem, id: "2" }],
        false
      )
    ).toBeUndefined();
    expect(
      getCirclePreviewItem(
        "round",
        [
          {
            id: "pdf",
            file: { name: "a.pdf", type: "application/pdf" } as File,
          },
        ],
        false
      )
    ).toBeUndefined();
    expect(
      getCirclePreviewItem(
        "round",
        [{ ...imageItem, status: "uploading" }],
        false
      )
    ).toBeUndefined();
    expect(
      getCirclePreviewItem("round", [{ ...imageItem, status: "error" }], false)
    ).toBeUndefined();
    expect(
      getCirclePreviewItem(
        "round",
        [{ ...imageItem, previewUrl: undefined }],
        false
      )
    ).toBeUndefined();
  });
});

describe("getListItems", () => {
  const photo: FileUploadItem = {
    id: "photo-1",
    file: { name: "photo.png" } as File,
  };
  const pdf: FileUploadItem = {
    id: "pdf-1",
    file: { name: "a.pdf" } as File,
  };

  it("returns all items when there is no circle preview", () => {
    expect(getListItems([photo, pdf])).toEqual([photo, pdf]);
  });

  it("omits the circle preview item", () => {
    expect(getListItems([photo, pdf], photo)).toEqual([pdf]);
  });

  it("does not mutate the original list", () => {
    const items = [photo, pdf];
    getListItems(items, photo);
    expect(items).toEqual([photo, pdf]);
  });
});

describe("getFieldValidation", () => {
  it("returns EMPTY_VALIDATION when the field is valid", () => {
    expect(getFieldValidation()).toBe(EMPTY_VALIDATION);
    expect(getFieldValidation(false)).toBe(EMPTY_VALIDATION);
  });

  it("returns a custom-error result when invalid", () => {
    const result = getFieldValidation(true, "Required");

    expect(result.isInvalid).toBe(true);
    expect(result.validationErrors).toEqual(["Required"]);
    expect(result.validationDetails.valid).toBe(false);
    expect(result.validationDetails.customError).toBe(true);
  });

  it("omits validationErrors when the message is a function", () => {
    expect(getFieldValidation(true, () => "Required").validationErrors).toEqual(
      []
    );
  });
});
