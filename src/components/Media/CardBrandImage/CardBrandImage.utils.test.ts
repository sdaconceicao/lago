import { getCardBrandLogoUrl } from "./CardBrandImage.utils";

describe("getCardBrandLogoUrl", () => {
  it("defaults to the pinned SVG asset", () => {
    expect(getCardBrandLogoUrl("visa")).toBe(
      "https://cdn.jsdelivr.net/gh/iamgutz/react-payment-logos@d90ff73460cad65ab68289d51b795545c63f7f04/src/svg/flat/visa.svg"
    );
  });

  it.each([
    [
      "https://assets.example.test/cards/",
      "https://assets.example.test/cards/amex.svg",
    ],
    [
      "https://assets.example.test/cards",
      "https://assets.example.test/cards/amex.svg",
    ],
    ["/assets/cards/", "/assets/cards/amex.svg"],
    ["/assets/cards", "/assets/cards/amex.svg"],
    ["cards/", "cards/amex.svg"],
    ["cards", "cards/amex.svg"],
  ])("joins the custom base %s to the SVG filename", (base, expected) => {
    expect(getCardBrandLogoUrl("amex", base)).toBe(expected);
  });

  it("uses the current directory when the base URL is empty", () => {
    expect(getCardBrandLogoUrl("mastercard", "")).toBe("mastercard.svg");
  });
});
