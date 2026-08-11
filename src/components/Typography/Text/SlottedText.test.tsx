import {
  assertClientBoundary,
  readSiblingSource,
} from "@test-utils/assertServerSafeSource";

describe("SlottedText", () => {
  it("declares the client boundary it needs", () => {
    assertClientBoundary(
      readSiblingSource("SlottedText.tsx", import.meta.url)
    );
  });
});
