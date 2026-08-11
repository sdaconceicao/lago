import {
  assertServerSafeSource,
  readSiblingSource,
} from "@test-utils/assertServerSafeSource";

describe("CheckboxIndicator", () => {
  it("carries no client boundary", () => {
    assertServerSafeSource(
      readSiblingSource("CheckboxIndicator.tsx", import.meta.url)
    );
  });
});
