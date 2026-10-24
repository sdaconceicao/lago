import { getVisibleToolbarGroupCount } from "./RichTextEditorToolbar.utils";

describe("getVisibleToolbarGroupCount", () => {
  it("keeps every group when they fit without a More button", () => {
    expect(getVisibleToolbarGroupCount([80, 80], 164, 4, 36)).toBe(2);
  });

  it("reserves space for More and the gaps between sections", () => {
    expect(getVisibleToolbarGroupCount([80, 80, 80], 204, 4, 36)).toBe(2);
  });

  it("moves a whole section when it misses the boundary by one pixel", () => {
    expect(getVisibleToolbarGroupCount([80, 80, 80], 203, 4, 36)).toBe(1);
  });

  it("moves every section into overflow when the first section is too wide", () => {
    expect(getVisibleToolbarGroupCount([200, 20], 150, 4, 36)).toBe(0);
  });

  it("handles a single oversized group", () => {
    expect(getVisibleToolbarGroupCount([200], 100, 4, 36)).toBe(0);
  });

  it("handles no groups and no available space", () => {
    expect(getVisibleToolbarGroupCount([], 0, 4, 36)).toBe(0);
    expect(getVisibleToolbarGroupCount([80], 0, 4, 36)).toBe(0);
  });

  it("preserves fractional layout measurements", () => {
    expect(getVisibleToolbarGroupCount([80.5, 80.5, 80.5], 205, 4, 36)).toBe(2);
    expect(getVisibleToolbarGroupCount([80.5, 80.5, 80.5], 204.5, 4, 36)).toBe(
      1
    );
  });
});
