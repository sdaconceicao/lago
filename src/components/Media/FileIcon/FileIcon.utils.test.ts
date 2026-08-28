import { getFileExtensionLabel } from "./FileIcon.utils";

describe("getFileExtensionLabel", () => {
  it("returns the uppercase extension", () => {
    expect(getFileExtensionLabel("invoice.pdf")).toBe("PDF");
    expect(getFileExtensionLabel("photo.jpeg")).toBe("JPEG");
    expect(getFileExtensionLabel("notes.TXT")).toBe("TXT");
  });

  it("truncates long extensions to four characters", () => {
    expect(getFileExtensionLabel("archive.webmanifest")).toBe("WEBM");
  });

  it("returns an empty string when there is no usable extension", () => {
    expect(getFileExtensionLabel("Makefile")).toBe("");
    expect(getFileExtensionLabel(".gitignore")).toBe("");
    expect(getFileExtensionLabel("trailing.")).toBe("");
  });
});
