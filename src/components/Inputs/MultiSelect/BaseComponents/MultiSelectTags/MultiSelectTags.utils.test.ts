import type { Key } from "react-aria-components/ComboBox";
import {
  createTagCache,
  getSignature,
  getVisibleTagCount,
  readFieldContentWidth,
  readFieldReserve,
  readTagWidths,
  readWidth,
  type SelectedItem,
} from "./MultiSelectTags.utils";

/** md defaults: 6px --field-gap, a "+N" chip around 32px wide. */
const fitted = (tagWidths: number[], availableWidth: number) =>
  getVisibleTagCount({ tagWidths, availableWidth, gap: 6, counterWidth: 32 });

/** Only `key` is read off a selected item, so the rest is not worth faking. */
const item = (key: Key) => ({ key }) as SelectedItem;

/** jsdom does not lay out, so every measured width has to be declared. */
const withWidth = <T extends HTMLElement>(element: T, width: number): T => {
  Object.defineProperty(element, "offsetWidth", { value: width });
  return element;
};

const tagContainer = (widths: number[], counterWidth?: number) => {
  const container = document.createElement("div");
  for (const width of widths) {
    const tag = document.createElement("span");
    tag.className = "react-aria-Tag";
    container.append(withWidth(tag, width));
  }
  if (counterWidth !== undefined) {
    const probe = document.createElement("span");
    probe.className = "probe";
    container.append(withWidth(probe, counterWidth));
  }
  return container;
};

describe("getSignature", () => {
  it("returns an empty string for an empty selection", () => {
    expect(getSignature([])).toBe("");
  });

  it("distinguishes selections by key and by order", () => {
    expect(getSignature([item("a"), item("b")])).not.toBe(
      getSignature([item("b"), item("a")])
    );
  });

  it("matches an identical selection built from different objects", () => {
    expect(getSignature([item("a"), item(2)])).toBe(
      getSignature([item("a"), item(2)])
    );
  });

  it("separates keys so a shared prefix cannot collide", () => {
    // "ab" + "c" and "a" + "bc" must not produce the same signature.
    expect(getSignature([item("ab"), item("c")])).not.toBe(
      getSignature([item("a"), item("bc")])
    );
  });
});

describe("createTagCache", () => {
  it("starts empty, so nothing is treated as measured", () => {
    expect(createTagCache()).toEqual({
      widths: new Map(),
      counterWidth: 0,
      reserve: null,
      contentWidth: 0,
      signature: "",
      keys: [],
      measured: null,
    });
  });

  it("returns a fresh cache each call", () => {
    const first = createTagCache();
    first.widths.set("a", 80);

    expect(createTagCache().widths.size).toBe(0);
  });
});

describe("readTagWidths", () => {
  it("returns each rendered tag's width in source order", () => {
    expect(readTagWidths(tagContainer([80, 120, 40]))).toEqual([80, 120, 40]);
  });

  it("returns nothing when the collection has not resolved yet", () => {
    expect(readTagWidths(tagContainer([]))).toEqual([]);
  });
});

describe("readWidth", () => {
  it("returns the width of the first match", () => {
    expect(readWidth(tagContainer([80], 32), ".probe")).toBe(32);
  });

  it("returns 0 when nothing matches", () => {
    expect(readWidth(tagContainer([80]), ".probe")).toBe(0);
  });
});

describe("readFieldContentWidth", () => {
  it("subtracts the field's inline padding", () => {
    const field = document.createElement("div");
    field.style.paddingInlineStart = "8px";
    field.style.paddingInlineEnd = "12px";
    Object.defineProperty(field, "clientWidth", { value: 300 });

    expect(readFieldContentWidth(field)).toBe(280);
  });

  it("treats an unset padding as 0", () => {
    const field = document.createElement("div");
    Object.defineProperty(field, "clientWidth", { value: 300 });

    expect(readFieldContentWidth(field)).toBe(300);
  });
});

describe("readFieldReserve", () => {
  const field = (options: { gap?: string; inputFloor?: string } = {}) => {
    const element = document.createElement("div");
    if (options.gap) element.style.columnGap = options.gap;
    if (options.inputFloor) {
      const input = document.createElement("input");
      input.style.minWidth = options.inputFloor;
      element.append(input);
    }
    return element;
  };

  it("reserves the input floor, the toggle and the gaps around them", () => {
    const element = field({ gap: "6px", inputFloor: "60px" });
    const toggle = document.createElement("button");
    toggle.className = "field-Button";
    element.append(withWidth(toggle, 24));

    // 60 input + 24 toggle + 2 x 6 gap
    expect(readFieldReserve(element)).toEqual({ gap: 6, reserved: 96 });
  });

  it("counts only the gaps when neither the input nor the toggle is there", () => {
    expect(readFieldReserve(field({ gap: "6px" }))).toEqual({
      gap: 6,
      reserved: 12,
    });
  });

  it("treats an unset gap as 0", () => {
    expect(readFieldReserve(field())).toEqual({ gap: 0, reserved: 0 });
  });
});

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
