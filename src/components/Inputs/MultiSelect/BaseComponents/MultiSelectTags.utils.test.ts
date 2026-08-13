import { getVisibleTagCount } from "./MultiSelectTags.utils";

/** md defaults: 6px --field-gap, a "+N" chip around 32px wide. */
const fitted = (tagWidths: number[], availableWidth: number) =>
  getVisibleTagCount({ tagWidths, availableWidth, gap: 6, counterWidth: 32 });

describe("getVisibleTagCount", () => {
  it("returns 0 when nothing is selected", () => {
    expect(fitted([], 300)).toBe(0);
  });

  describe("before measurement", () => {
    // SSR, jsdom and the first client render all land here. Showing everything
    // keeps the server output stable and the layout effect narrows it before
    // the browser paints.
    it("shows every tag when the width is unmeasured", () => {
      expect(fitted([100, 100, 100], 0)).toBe(3);
    });

    it("shows every tag when the width is negative", () => {
      expect(fitted([100, 100, 100], -10)).toBe(3);
    });
  });

  describe("when the whole selection fits", () => {
    it("shows every tag and reserves nothing for a counter", () => {
      // 3 x 80 + 2 x 6 gap = 252
      expect(fitted([80, 80, 80], 252)).toBe(3);
    });

    it("shows a single tag that exactly fills the row", () => {
      expect(fitted([200], 200)).toBe(1);
    });

    it("ignores the counter width when no counter will be rendered", () => {
      // 252 of tags in 260 of room: fits, even though 252 + 32 would not.
      expect(fitted([80, 80, 80], 260)).toBe(3);
    });
  });

  describe("when the selection overflows", () => {
    it("reserves room for the counter before fitting tags", () => {
      // 240 - 32 counter - 6 gap = 202 for tags; two 80s plus their gap = 166,
      // a third would need 252.
      expect(fitted([80, 80, 80, 80], 240)).toBe(2);
    });

    it("counts the gap between tags", () => {
      // 202 of tag room: 100 + 6 + 100 = 206, so only the first fits.
      expect(fitted([100, 100, 100], 240)).toBe(1);
    });

    it("shows more tags as the row grows", () => {
      const widths = [80, 80, 80, 80, 80];
      expect(fitted(widths, 200)).toBe(1);
      expect(fitted(widths, 300)).toBe(3);
      expect(fitted(widths, 380)).toBe(4);
    });

    it("shows every tag once the row is wide enough", () => {
      expect(fitted([80, 80, 80, 80, 80], 424)).toBe(5);
    });

    it("respects tags of differing widths", () => {
      // 302 - 38 = 264 for tags: 175 + 6 + 80 = 261 fits, + 6 + 90 does not.
      expect(fitted([175, 80, 90, 120], 302)).toBe(2);
    });
  });

  describe("when not even the first tag fits", () => {
    // The remaining tag is ellipsised by CSS rather than dropped: "Philadelphia
    // Cou… +4" identifies the selection, a bare "+5" does not.
    it("still shows one tag", () => {
      expect(fitted([175, 175, 175], 120)).toBe(1);
    });

    it("still shows one tag when the counter alone exceeds the row", () => {
      expect(fitted([175, 175], 20)).toBe(1);
    });
  });
});
