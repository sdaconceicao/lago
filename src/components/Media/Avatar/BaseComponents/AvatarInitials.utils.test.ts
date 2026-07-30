import { getInitials, getInitialsColor } from "./AvatarInitials.utils";

describe("getInitials", () => {
  it("takes two letters from a first and last name", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
  });

  it("uses the first and last name, skipping middle names", () => {
    expect(getInitials("Augusta Ada Byron King")).toBe("AK");
  });

  it("uppercases initials taken from a lowercase name", () => {
    expect(getInitials("ada lovelace")).toBe("AL");
  });

  it("collapses repeated whitespace between names", () => {
    expect(getInitials("Ada   Lovelace")).toBe("AL");
  });

  it("ignores surrounding whitespace", () => {
    expect(getInitials("  Ada Lovelace  ")).toBe("AL");
  });

  it("drops the domain from an email address", () => {
    expect(getInitials("ada.lovelace@example.com")).toBe("AL");
  });

  it("treats dots, underscores and hyphens as name separators", () => {
    expect(getInitials("ada.lovelace")).toBe("AL");
    expect(getInitials("ada_lovelace")).toBe("AL");
    expect(getInitials("ada-lovelace")).toBe("AL");
  });

  it("spans a hyphenated surname to the last name given", () => {
    expect(getInitials("Augusta Ada King-Noel")).toBe("AN");
  });

  it("uses a single letter when the string is not a name", () => {
    expect(getInitials("alovelace")).toBe("A");
    expect(getInitials("alovelace@example.com")).toBe("A");
  });

  it("uses a single letter for a mononym", () => {
    expect(getInitials("Ada")).toBe("A");
  });

  it("keeps an apostrophe name whole", () => {
    expect(getInitials("O'Brien")).toBe("O");
  });

  it("keeps the first letter of a single non-latin name", () => {
    expect(getInitials("李雷")).toBe("李");
  });

  it("takes initials from both parts of a non-latin name", () => {
    expect(getInitials("Ада Лавлейс")).toBe("АЛ");
  });

  it("ignores parts that carry no letters", () => {
    expect(getInitials("ada.lovelace.1815")).toBe("AL");
    expect(getInitials("lovelace1815")).toBe("L");
  });

  it("skips leading punctuation", () => {
    expect(getInitials("@lovelace")).toBe("L");
  });

  it("falls back to the first character when there are no letters at all", () => {
    expect(getInitials("1815")).toBe("1");
  });

  it("returns an empty string for an empty or blank value", () => {
    expect(getInitials("")).toBe("");
    expect(getInitials("   ")).toBe("");
  });

  it("returns the same result for the same input", () => {
    expect(getInitials("Ada Lovelace")).toBe(getInitials("Ada Lovelace"));
  });
});

describe("getInitialsColor", () => {
  it("returns a theme colour reference", () => {
    expect(getInitialsColor("Ada Lovelace")).toMatch(/^var\(--[a-z]+\)$/);
  });

  it("returns the same colour for the same name", () => {
    expect(getInitialsColor("Ada Lovelace")).toBe(
      getInitialsColor("Ada Lovelace")
    );
  });

  it("ignores case and surrounding whitespace", () => {
    expect(getInitialsColor("  ADA LOVELACE ")).toBe(
      getInitialsColor("ada lovelace")
    );
  });

  it("gives different names different colours", () => {
    const colors = new Set(
      [
        "Ada Lovelace",
        "Grace Hopper",
        "Alan Turing",
        "Katherine Johnson",
        "Edsger Dijkstra",
      ].map(getInitialsColor)
    );

    expect(colors.size).toBeGreaterThan(1);
  });

  it("returns a colour for an empty value", () => {
    expect(getInitialsColor("")).toMatch(/^var\(--[a-z]+\)$/);
  });

  it("stays within the palette for a long value", () => {
    const color = getInitialsColor("a".repeat(500));

    expect(color).toMatch(/^var\(--[a-z]+\)$/);
  });
});
