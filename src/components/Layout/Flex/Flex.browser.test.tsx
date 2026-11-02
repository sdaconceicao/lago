import { composeStories } from "@storybook/react";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import * as stories from "./Flex.stories";

const { Responsive } = composeStories(stories);
const originalViewport = {
  width: window.innerWidth,
  height: window.innerHeight,
};

afterEach(async () => {
  await page.viewport(originalViewport.width, originalViewport.height);
});

describe("responsive flex layouts", () => {
  it.each([
    { width: 240, range: "narrow base" },
    { width: 319, range: "below xs" },
    { width: 320, range: "xs" },
    { width: 639, range: "below sm" },
    { width: 640, range: "sm" },
    { width: 767, range: "below md" },
    { width: 768, range: "md" },
    { width: 1023, range: "below lg" },
    { width: 1024, range: "lg" },
    { width: 1279, range: "below xl" },
    { width: 1280, range: "xl" },
    { width: 1440, range: "wide xl" },
  ])("resolves $range values at $width pixels", async ({ width }) => {
    await page.viewport(width, 900);
    expect(window.innerWidth).toBe(width);

    await Responsive.run();
  });
});
