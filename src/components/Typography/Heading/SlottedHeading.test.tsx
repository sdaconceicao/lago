import {
  assertClientBoundary,
  readSiblingSource,
} from "@test-utils/assertServerSafeSource";

describe("SlottedHeading", () => {
  it("declares the client boundary it needs", () => {
    assertClientBoundary(
      readSiblingSource("SlottedHeading.tsx", import.meta.url)
    );
  });
});
