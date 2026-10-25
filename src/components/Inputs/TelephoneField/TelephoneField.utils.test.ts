import { TELEPHONE_COUNTRIES } from "./TelephoneField.countries";
import {
  formatTelephoneDigits,
  formatTelephoneValue,
  getTelephoneCaretPosition,
  getTelephoneCountries,
  getTelephoneCountry,
  getTelephoneDigits,
  limitTelephoneDigits,
  parseTelephoneValue,
} from "./TelephoneField.utils";

describe("getTelephoneDigits", () => {
  it("retains only ASCII digits", () => {
    expect(getTelephoneDigits(" +1 (212) 555-0123 ext. a٤５ ")).toBe(
      "12125550123"
    );
  });

  it("returns an empty string when there are no digits", () => {
    expect(getTelephoneDigits("")).toBe("");
    expect(getTelephoneDigits("telephone")).toBe("");
  });
});

describe("getTelephoneCountry", () => {
  it("resolves country codes without regard to case", () => {
    expect(getTelephoneCountry("us")).toMatchObject({
      country: "US",
      callingCode: "1",
    });
  });

  it("does not guess missing or unsupported country codes", () => {
    expect(getTelephoneCountry()).toBeNull();
    expect(getTelephoneCountry("")).toBeNull();
    expect(getTelephoneCountry("ZZ")).toBeNull();
  });
});

describe("getTelephoneCountries", () => {
  it("includes every supported country by default", () => {
    expect(getTelephoneCountries()).toEqual(TELEPHONE_COUNTRIES);
  });

  it("filters case-insensitively while preserving dataset order", () => {
    expect(
      getTelephoneCountries(["us", "FR", "us", "ZZ"]).map(
        ({ country }) => country
      )
    ).toEqual(["FR", "US"]);
  });

  it("lets exclusions override inclusions", () => {
    expect(
      getTelephoneCountries(["US", "CA"], ["us"]).map(({ country }) => country)
    ).toEqual(["CA"]);
  });

  it("can exclude countries without an inclusion list", () => {
    expect(getTelephoneCountries(undefined, ["US"])).not.toContainEqual(
      getTelephoneCountry("US")
    );
  });

  it("treats an explicit empty inclusion list as no choices", () => {
    expect(getTelephoneCountries([])).toEqual([]);
  });

  it("does not mutate either filter or the country dataset", () => {
    const included = ["us", "FR"];
    const excluded = ["FR"];
    const before = TELEPHONE_COUNTRIES.map((country) => ({ ...country }));

    getTelephoneCountries(included, excluded);

    expect(included).toEqual(["us", "FR"]);
    expect(excluded).toEqual(["FR"]);
    expect(TELEPHONE_COUNTRIES).toEqual(before);
  });
});

describe("parseTelephoneValue", () => {
  it("defaults national input to the United States", () => {
    expect(parseTelephoneValue("(212) 555-0123")).toEqual({
      country: getTelephoneCountry("US"),
      callingCode: "1",
      digits: "2125550123",
    });
  });

  it("keeps national zeroes when a country is provided", () => {
    expect(parseTelephoneValue("02 1234 5678", "it")).toEqual({
      country: getTelephoneCountry("IT"),
      callingCode: "39",
      digits: "0212345678",
    });
  });

  it("does not replace an unsupported explicit country with the default", () => {
    expect(parseTelephoneValue("1234", "ZZ")).toEqual({
      country: null,
      callingCode: "",
      digits: "1234",
    });
  });

  it("resolves a unique international prefix after leading whitespace", () => {
    expect(parseTelephoneValue("  +33 1 23 45 67 89")).toEqual({
      country: getTelephoneCountry("FR"),
      callingCode: "33",
      digits: "123456789",
    });
  });

  it("finds a complete three-digit calling code", () => {
    expect(parseTelephoneValue("+972 50 123 4567")).toEqual({
      country: getTelephoneCountry("IL"),
      callingCode: "972",
      digits: "501234567",
    });
  });

  it.each(["+1 212 555 0123", "+44 2079 460 958", "+7 912 345 6789"])(
    "leaves shared international prefixes unresolved: %s",
    (value) => {
      expect(parseTelephoneValue(value).country).toBeNull();
    }
  );

  it("uses a preferred country only when its calling code matches", () => {
    expect(parseTelephoneValue("+1 416 555 0123", "ca")).toEqual({
      country: getTelephoneCountry("CA"),
      callingCode: "1",
      digits: "4165550123",
    });
  });

  it("retains an international value when its preferred country conflicts", () => {
    expect(parseTelephoneValue("+33 1 23 45 67 89", "US")).toEqual({
      country: null,
      callingCode: "33",
      digits: "123456789",
    });
    expect(parseTelephoneValue("+33 1234", "ZZ").country).toBeNull();
  });

  it("does not mistake an unknown prefix for a national number", () => {
    expect(parseTelephoneValue("+999 123 456", "US")).toEqual({
      country: null,
      callingCode: "",
      digits: "999123456",
    });
  });

  it("retains all digits without truncating or removing national zeroes", () => {
    expect(parseTelephoneValue("+33 01234567890123456789").digits).toBe(
      "01234567890123456789"
    );
  });

  it("handles empty and incomplete international values", () => {
    expect(parseTelephoneValue("").digits).toBe("");
    expect(parseTelephoneValue("+")).toEqual({
      country: null,
      callingCode: "",
      digits: "",
    });
    expect(parseTelephoneValue("+33")).toEqual({
      country: getTelephoneCountry("FR"),
      callingCode: "33",
      digits: "",
    });
  });
});

describe("formatTelephoneDigits", () => {
  it("defaults to US parentheses formatting", () => {
    expect(formatTelephoneDigits("2125550123")).toBe("(212) 555-0123");
  });

  it.each([
    ["spaces", "212 555 0123"],
    ["dashes", "212-555-0123"],
    ["digits", "2125550123"],
  ] as const)("supports the %s display style", (format, expected) => {
    expect(formatTelephoneDigits("(212) 555-0123", "us", format)).toBe(
      expected
    );
  });

  it.each([
    ["CA", "4165550123", "416 555 0123"],
    ["GB", "2079460958", "2079 460 958"],
    ["FR", "123456789", "1 23 45 67 89"],
    ["AU", "412345678", "412 345 678"],
    ["IN", "9876543210", "98765 43210"],
    ["BR", "1134567890", "11 3456 7890"],
    ["BR", "11987654321", "11 98765 4321"],
    ["MX", "5512345678", "55 1234 5678"],
    ["JP", "9012345678", "90 1234 5678"],
    ["DE", "3012345678", "301 234 5678"],
  ])("groups %s national digits", (country, digits, expected) => {
    expect(formatTelephoneDigits(digits, country, "spaces")).toBe(expected);
  });

  it("uses a generic grouping for countries without a common display preset", () => {
    expect(formatTelephoneDigits("123456789012", "ZZ", "spaces")).toBe(
      "123 456 789 012"
    );
    expect(formatTelephoneDigits("1234", "DE", "spaces")).toBe("1234");
  });

  it("closes the first parenthesized group only when it is complete", () => {
    expect(formatTelephoneDigits("21")).toBe("(21");
    expect(formatTelephoneDigits("212")).toBe("(212)");
    expect(formatTelephoneDigits("2125")).toBe("(212) 5");
  });

  it("applies the documented parentheses style to other countries", () => {
    expect(formatTelephoneDigits("123456789", "FR")).toBe("(1)23-45-67-89");
    expect(formatTelephoneDigits("4165550123", "CA")).toBe("(416) 555-0123");
  });

  it("keeps digits that extend beyond a common preset", () => {
    expect(formatTelephoneDigits("412345678901", "AU", "spaces")).toBe(
      "412 345 678 901"
    );
    expect(formatTelephoneDigits("2125550123456", "US")).toBe(
      "(212) 555-0123-456"
    );
  });

  it("uses a custom mask in preference to a display preset", () => {
    expect(formatTelephoneDigits("123456", "US", "digits", "##.##.##")).toBe(
      "12.34.56"
    );
  });

  it("waits for a following digit before adding custom mask literals", () => {
    expect(formatTelephoneDigits("123", "US", "spaces", "###-###")).toBe("123");
    expect(formatTelephoneDigits("1234", "US", "spaces", "###-###")).toBe(
      "123-4"
    );
    expect(formatTelephoneDigits("123", "US", "spaces", "(###) ###")).toBe(
      "(123"
    );
  });

  it("preserves overflow beyond custom mask slots", () => {
    expect(formatTelephoneDigits("123456789", "US", "spaces", "###-###")).toBe(
      "123-456789"
    );
    expect(formatTelephoneDigits("1234", "US", "spaces", "")).toBe("1234");
  });

  it("returns empty text without digits or mask literals", () => {
    expect(formatTelephoneDigits("")).toBe("");
    expect(formatTelephoneDigits("none", "US", "spaces", "+###")).toBe("");
  });

  it("is stable when formatting an already formatted national value", () => {
    const formatted = formatTelephoneDigits("2125550123");

    expect(formatTelephoneDigits(formatted)).toBe(formatted);
  });
});

describe("limitTelephoneDigits", () => {
  it("enforces the country's national limit after removing punctuation", () => {
    expect(limitTelephoneDigits("212 555 0123 456", "1", "US")).toBe(
      "2125550123"
    );
  });

  it("uses the international length bound when no country is known", () => {
    expect(limitTelephoneDigits("1234567890123456", "999")).toBe(
      "123456789012"
    );
    expect(limitTelephoneDigits("1234567890123456", "", "ZZ")).toBe(
      "123456789012345"
    );
  });

  it("does not allow a conflicting longer calling code to exceed 15 digits", () => {
    expect(limitTelephoneDigits("1234567890123456", "999", "DE")).toBe(
      "123456789012"
    );
  });

  it("handles empty values and an overlong calling code", () => {
    expect(limitTelephoneDigits("", "1", "US")).toBe("");
    expect(limitTelephoneDigits("123", "1234567890123456")).toBe("");
  });
});

describe("formatTelephoneValue", () => {
  it("joins a calling code and the formatted national value", () => {
    expect(formatTelephoneValue("1", "(212) 555-0123")).toBe(
      "+1 (212) 555-0123"
    );
  });

  it("preserves the plus sign for unresolved international digits", () => {
    expect(formatTelephoneValue("", "999123456")).toBe("+999123456");
  });

  it("leaves an empty national value empty", () => {
    expect(formatTelephoneValue("1", "")).toBe("");
    expect(formatTelephoneValue("", "")).toBe("");
  });
});

describe("getTelephoneCaretPosition", () => {
  it("counts calling code and national digits while skipping punctuation", () => {
    expect(getTelephoneCaretPosition("+1 (212) 555-0123", 1)).toBe(2);
    expect(getTelephoneCaretPosition("+1 (212) 555-0123", 4)).toBe(7);
    expect(getTelephoneCaretPosition("+1 (212) 555-0123", 5)).toBe(10);
  });

  it("starts before all digits for nonpositive counts", () => {
    expect(getTelephoneCaretPosition("+1 (212)", 0)).toBe(0);
    expect(getTelephoneCaretPosition("+1 (212)", -1)).toBe(0);
  });

  it("clamps to the end when there are fewer digits than requested", () => {
    expect(getTelephoneCaretPosition("+1 (212)", 20)).toBe(8);
    expect(getTelephoneCaretPosition("", 1)).toBe(0);
  });
});
