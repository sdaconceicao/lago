import { TELEPHONE_COUNTRIES } from "./TelephoneField.countries";

describe("TELEPHONE_COUNTRIES", () => {
  it.each([
    ["US", "1", 10],
    ["CA", "1", 10],
    ["GB", "44", 10],
    ["FR", "33", 9],
    ["DE", "49", 13],
    ["AU", "61", 12],
    ["IN", "91", 13],
    ["BR", "55", 11],
    ["MX", "52", 10],
    ["JP", "81", 13],
  ])(
    "provides the calling code and digit limit for %s",
    (country, callingCode, maxLength) => {
      expect(
        TELEPHONE_COUNTRIES.find((entry) => entry.country === country)
      ).toEqual({
        country,
        callingCode,
        maxLength,
      });
    }
  );

  it("includes dialing territories with their own country selector entries", () => {
    expect(TELEPHONE_COUNTRIES).toEqual(
      expect.arrayContaining([
        { country: "FO", callingCode: "298", maxLength: 6 },
        { country: "SH", callingCode: "290", maxLength: 5 },
        { country: "XK", callingCode: "383", maxLength: 12 },
      ])
    );
  });

  it("includes each supported country once", () => {
    const countries = TELEPHONE_COUNTRIES.map((entry) => entry.country);

    expect(countries).toHaveLength(243);
    expect(new Set(countries).size).toBe(countries.length);
  });

  it.each(["AC", "TA"])(
    "excludes %s because the pinned flag library has no SVG for it",
    (country) => {
      expect(
        TELEPHONE_COUNTRIES.some((entry) => entry.country === country)
      ).toBe(false);
    }
  );

  it("uses country codes and lengths compatible with international dialing", () => {
    for (const entry of TELEPHONE_COUNTRIES) {
      expect(entry.country).toMatch(/^[A-Z]{2}$/);
      expect(entry.callingCode).toMatch(/^[1-9]\d{0,2}$/);
      expect(entry.maxLength).toBeGreaterThan(0);
      expect(entry.callingCode.length + entry.maxLength).toBeLessThanOrEqual(
        15
      );
    }
  });
});
