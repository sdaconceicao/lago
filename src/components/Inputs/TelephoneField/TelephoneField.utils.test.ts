import { TELEPHONE_COUNTRIES } from "./TelephoneField.countries";
import {
  formatTelephoneDigits,
  formatTelephoneInput,
  formatTelephoneValue,
  getTelephoneCaretPosition,
  getTelephoneCountries,
  getTelephoneCountry,
  getTelephoneDigits,
  getTelephoneMaskEdit,
  getTelephonePlaceholder,
  isTelephoneDigitEditable,
  limitTelephoneDigits,
  parseTelephoneValue,
} from "./TelephoneField.utils";

const telephoneFormats = ["parentheses", "spaces", "dashes", "digits"] as const;
const formatPatterns = {
  parentheses: /^(?:\(\d+(?:\)(?: \d+(?:-\d+)*)?)?)?$/,
  spaces: /^(?:\d+(?: \d+)*)?$/,
  dashes: /^(?:\d+(?:-\d+)*)?$/,
  digits: /^\d*$/,
};

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

  it.each([
    ["０１２٣٤۵ⅫＡＢＣ", ""],
    [" \u200B+1\u00A0(020)\t٠٣abc４５\n-006", "1020006"],
    ["(00)-12.ext ABC#3", "00123"],
  ])("sanitizes Unicode, letters and punctuation in %j", (value, expected) => {
    expect(getTelephoneDigits(value)).toBe(expected);
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
    expect(getTelephoneCountry("AC")).toBeNull();
    expect(getTelephoneCountry("TA")).toBeNull();
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
  it("keeps Saint Helena's supported calling code after removing Tristan da Cunha", () => {
    expect(parseTelephoneValue("+290 1234")).toEqual({
      country: getTelephoneCountry("SH"),
      callingCode: "290",
      digits: "1234",
    });
  });

  it("preserves unsupported Ascension Island numbers without selecting a country", () => {
    const parsed = parseTelephoneValue("+247 123456");
    expect(parsed).toEqual({
      country: null,
      callingCode: "",
      digits: "247123456",
    });
    expect(formatTelephoneValue(parsed.callingCode, parsed.digits)).toBe(
      "+247123456"
    );
  });
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

  it.each([
    {
      scenario: "national trunk zeros",
      value: "00 0123 0456",
      preferred: "IT",
      country: "IT",
      callingCode: "39",
      digits: "0001230456",
    },
    {
      scenario: "unresolved +1",
      value: "+1 (000) 123-0456",
      preferred: undefined,
      country: null,
      callingCode: "1",
      digits: "0001230456",
    },
    {
      scenario: "explicit shared-code preference",
      value: "+1 (000) 123-0456",
      preferred: "CA",
      country: "CA",
      callingCode: "1",
      digits: "0001230456",
    },
    {
      scenario: "unresolved +44 with trunk zeros",
      value: "+44 020 001 0200",
      preferred: undefined,
      country: null,
      callingCode: "44",
      digits: "0200010200",
    },
    {
      scenario: "conflicting country",
      value: "+33 001 020 030",
      preferred: "US",
      country: null,
      callingCode: "33",
      digits: "001020030",
    },
    {
      scenario: "unknown international prefix",
      value: "+999 000 123",
      preferred: "US",
      country: null,
      callingCode: "",
      digits: "999000123",
    },
  ])(
    "round-trips $scenario without guessing or losing zeros",
    ({ value, preferred, country, callingCode, digits }) => {
      const parsed = parseTelephoneValue(value, preferred);
      expect(parsed).toEqual({
        country: country ? getTelephoneCountry(country) : null,
        callingCode,
        digits,
      });

      for (const format of telephoneFormats) {
        const national = formatTelephoneInput(
          parsed,
          TELEPHONE_COUNTRIES,
          format
        );
        const full = formatTelephoneValue(parsed.callingCode, national);
        expect(parseTelephoneValue(full, preferred)).toEqual(parsed);
      }
    }
  );
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
    ["FO", "242567", "242 567"],
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

  it("uses generic groups with a stable first group for known countries", () => {
    expect(formatTelephoneDigits("123456789012", "ZZ", "spaces")).toBe(
      "123 456 789 012"
    );
    expect(formatTelephoneDigits("1234", "DE", "spaces")).toBe("123 4");
  });

  it("closes the first parenthesized group only when it is complete", () => {
    expect(formatTelephoneDigits("21")).toBe("(21");
    expect(formatTelephoneDigits("212")).toBe("(212)");
    expect(formatTelephoneDigits("2125")).toBe("(212) 5");
  });

  it.each([
    ["24", "(24"],
    ["242", "(242)"],
    ["2425", "(242) 5"],
    ["242567", "(242) 567"],
  ])(
    "keeps Faroe Islands groups stable while typing %s",
    (digits, expected) => {
      expect(formatTelephoneDigits(digits, "FO")).toBe(expected);
    }
  );

  it.each([
    ["CA", "4165550123", "(416) 555-0123"],
    ["AG", "3643463463", "(364) 346-3463"],
    ["FR", "123456789", "(1) 23-45-67-89"],
    ["GB", "2079460958", "(2079) 460-958"],
  ])(
    "separates the parenthesized group for %s",
    (country, digits, expected) => {
      expect(formatTelephoneDigits(digits, country)).toBe(expected);
    }
  );

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

  it.each([
    ["", "001234", "001234"],
    ["##.##", "001234", "00.1234"],
    ["tel: ", "001234", "tel: 001234"],
    ["()", "001234", "()001234"],
    ["(##) ##", "00", "(00"],
    ["(##) ##", "001", "(00) 1"],
    ["##/##/", "0012", "00/12"],
    ["##/##/", "00123", "00/12/3"],
    ["· ## / ##", "0012", "· 00 / 12"],
  ])(
    "preserves literal mask %j and overflow for %s",
    (mask, digits, expected) => {
      for (const format of telephoneFormats) {
        expect(formatTelephoneDigits(digits, "US", format, mask)).toBe(
          expected
        );
        expect(formatTelephoneDigits(expected, "US", format, mask)).toBe(
          expected
        );
      }
    }
  );

  it.each(["tel: ", "()", "· ## / ##"])(
    "does not emit mask literals without digits for %j",
    (mask) => {
      expect(formatTelephoneDigits("", "US", "parentheses", mask)).toBe("");
      expect(formatTelephoneDigits("ＡＢＣ１２٣", "US", "spaces", mask)).toBe(
        ""
      );
    }
  );
});

describe("getTelephonePlaceholder", () => {
  it.each([
    ["US", "(000) 000-0000"],
    ["gb", "(0000) 000-000"],
    ["FR", "(0) 00-00-00-00"],
    ["FO", "(000) 000"],
    ["SB", "(000) 0000"],
    ["CK", "(000) 00"],
    ["AU", "(000) 000-000"],
    ["IN", "(00000) 00000"],
    ["JP", "(00) 0000-0000"],
    ["BR", "(00) 00000-0000"],
  ])("follows the existing display groups for %s", (country, expected) => {
    expect(getTelephonePlaceholder(country)).toBe(expected);
  });

  it.each([
    ["spaces", "000 000 0000"],
    ["dashes", "000-000-0000"],
    ["digits", "0000000000"],
  ] as const)("uses the %s format", (format, expected) => {
    expect(getTelephonePlaceholder("US", format)).toBe(expected);
  });

  it.each([
    ["###.###.####", "000.000.0000"],
    ["##.##", "00.00000000"],
    ["", "0000000000"],
  ])("follows the input's custom mask %j", (mask, expected) => {
    expect(getTelephonePlaceholder("US", "dashes", mask)).toBe(expected);
  });

  it.each([undefined, "", "ZZ"])(
    "does not guess a country for %j",
    (country) => {
      expect(getTelephonePlaceholder(country)).toBeUndefined();
    }
  );
});

describe("formatTelephoneInput", () => {
  it("defaults to parentheses for an allowed country", () => {
    expect(
      formatTelephoneInput(
        parseTelephoneValue("2125550123"),
        getTelephoneCountries(["US"])
      )
    ).toBe("(212) 555-0123");
  });

  it("recognizes an allowed country when its definition was copied", () => {
    const countries = getTelephoneCountries(["US"]).map((country) => ({
      ...country,
    }));

    expect(
      formatTelephoneInput(parseTelephoneValue("2125550123"), countries)
    ).toBe("(212) 555-0123");
  });

  it.each([
    ["parentheses", "(212) 555-0123"],
    ["spaces", "212 555 0123"],
    ["dashes", "212-555-0123"],
    ["digits", "2125550123"],
  ] as const)(
    "uses the %s preset for an allowed country",
    (format, expected) => {
      expect(
        formatTelephoneInput(
          parseTelephoneValue("2125550123"),
          getTelephoneCountries(["US"]),
          format
        )
      ).toBe(expected);
    }
  );

  it.each([
    ["filtered", parseTelephoneValue("2125550123"), ["FR"]],
    ["unresolved", parseTelephoneValue("+12125550123"), ["US"]],
  ] as const)(
    "leaves digits raw when the country is %s",
    (_, parsed, allowed) => {
      expect(formatTelephoneInput(parsed, getTelephoneCountries(allowed))).toBe(
        "2125550123"
      );
    }
  );

  it.each([
    ["allowed", parseTelephoneValue("2125550123"), ["US"]],
    ["filtered", parseTelephoneValue("2125550123"), ["FR"]],
    ["unresolved", parseTelephoneValue("+12125550123"), ["US"]],
  ] as const)(
    "uses a custom mask when the country is %s",
    (_, parsed, allowed) => {
      expect(
        formatTelephoneInput(
          parsed,
          getTelephoneCountries(allowed),
          "dashes",
          "##.##.##.####"
        )
      ).toBe("21.25.55.0123");
    }
  );

  it("lets an empty custom mask override the preset", () => {
    expect(
      formatTelephoneInput(
        parseTelephoneValue("2125550123"),
        getTelephoneCountries(["US"]),
        "parentheses",
        ""
      )
    ).toBe("2125550123");
  });

  it("keeps an empty number empty even with mask literals", () => {
    expect(
      formatTelephoneInput(
        parseTelephoneValue(""),
        getTelephoneCountries(["US"]),
        "parentheses",
        "(###) ###-####"
      )
    ).toBe("");
  });

  it("does not mutate its inputs and returns the same display repeatedly", () => {
    const parsed = parseTelephoneValue("2125550123");
    const countries = getTelephoneCountries(["US", "FR"]);
    const beforeParsed = structuredClone(parsed);
    const beforeCountries = structuredClone(countries);

    const first = formatTelephoneInput(parsed, countries, "spaces");
    const second = formatTelephoneInput(parsed, countries, "spaces");

    expect(first).toBe("212 555 0123");
    expect(second).toBe(first);
    expect(parsed).toEqual(beforeParsed);
    expect(countries).toEqual(beforeCountries);
  });
});

describe("limitTelephoneDigits", () => {
  it.each(TELEPHONE_COUNTRIES)(
    "enforces $country boundaries and the international total after a long paste",
    ({ country, callingCode, maxLength }) => {
      const permitted = "00123456789012".slice(0, maxLength);
      const below = permitted.slice(0, -1);
      const cases = [
        { input: below, expected: below },
        { input: permitted, expected: permitted },
        { input: `${permitted}9`, expected: permitted },
        {
          input: `００١ ext ${permitted.split("").join(" - ")} ${"9".repeat(30)} ABC`,
          expected: permitted,
        },
      ];

      for (const { input, expected } of cases) {
        const limited = limitTelephoneDigits(
          input,
          `+(${callingCode})`,
          country
        );
        expect(limited).toBe(expected);
        expect(limited).toMatch(/^\d+$/);
        expect(limited.length).toBeLessThanOrEqual(maxLength);
        expect(callingCode.length + limited.length).toBeLessThanOrEqual(15);
        expect(limitTelephoneDigits(limited, callingCode, country)).toBe(
          limited
        );
      }
    }
  );

  it("keeps short and zero-only input because length limiting is not validity checking", () => {
    expect(limitTelephoneDigits("0", "1", "US")).toBe("0");
    expect(limitTelephoneDigits("0000000000", "1", "US")).toBe("0000000000");
  });

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
  it.each([
    ["01.2345678901", 0, 0],
    ["01.2345678901", 2, 2],
    ["01.2345678901", 3, 4],
    ["01.2345678901", 12, 13],
    ["01.2345678901", 99, 13],
    ["phone: 00123", 1, 8],
    ["phone: 00123", 5, 12],
    ["(012) 345-6789-01", 11, 16],
    ["(012) 345-6789-01", 12, 17],
  ] as const)(
    "anchors %j after %i digits, including mask overflow",
    (formatted, count, position) => {
      expect(getTelephoneCaretPosition(formatted, count)).toBe(position);
    }
  );

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

describe("fixed numeric mask literals", () => {
  it.each([
    ["0##-##", "1234", "012-34"],
    ["0##-##", "01234", "012-34"],
    ["0##-##", "012-34", "012-34"],
    ["0##-##", "0", "0"],
    ["##0-##", "1234", "120-34"],
    ["##0-##", "12034", "120-34"],
    ["##0-##", "12", "12"],
    ["##0-##", "120", "120"],
    ["##00-##", "1234", "1200-34"],
    ["(##) 9####-####", "1187654321", "(11) 98765-4321"],
    ["(##) 9####-####", "11987654321", "(11) 98765-4321"],
    ["00", "1234", "001234"],
    ["00", "001234", "001234"],
    ["##0", "1234", "12034"],
    ["0##-##", "", ""],
  ])(
    "formats %s with %j without duplicating literals",
    (mask, value, expected) => {
      for (const format of telephoneFormats) {
        const formatted = formatTelephoneDigits(value, "BR", format, mask);
        expect(formatted).toBe(expected);
        expect(formatTelephoneDigits(formatted, "BR", format, mask)).toBe(
          expected
        );
        const full = formatTelephoneValue("55", formatted);
        const parsed = parseTelephoneValue(full, "BR");
        expect(
          formatTelephoneInput(parsed, TELEPHONE_COUNTRIES, format, mask)
        ).toBe(expected);
      }
    }
  );

  it.each(["0##-##", "##0-##", "##00-##", "(##) 9####-####", "00", "##0"])(
    "keeps repeated formatting stable for each partial value in %s",
    (mask) => {
      for (const sample of ["000000000000", "123456789012", "999999999999"]) {
        for (let length = 0; length <= sample.length; length += 1) {
          const formatted = formatTelephoneDigits(
            sample.slice(0, length),
            "US",
            "digits",
            mask
          );
          expect(formatTelephoneDigits(formatted, "US", "digits", mask)).toBe(
            formatted
          );
        }
      }
    }
  );

  it("counts inserted numeric literals toward national and international limits", () => {
    expect(limitTelephoneDigits("1234567890", "1", "US", "0##########")).toBe(
      "0123456789"
    );
    expect(
      limitTelephoneDigits("1187654321", "55", "BR", "(##) 9####-####")
    ).toBe("11987654321");
    expect(
      limitTelephoneDigits(
        "123456789012345",
        "999",
        undefined,
        "0###############"
      )
    ).toBe("012345678901");
  });

  it("includes fixed digits in placeholders without exceeding the country's limit", () => {
    const placeholder = getTelephonePlaceholder(
      "BR",
      "digits",
      "(##) 9####-####"
    );
    expect(placeholder).toBe("(00) 90000-0000");
    expect(getTelephoneDigits(placeholder ?? "")).toHaveLength(11);
    expect(getTelephonePlaceholder("US", "digits", "0##########")).toBe(
      "0000000000"
    );
  });

  it.each([
    ["120-34", "10-34", "##0-##", 1, "1304", 1],
    ["120-34", "120-4", "##0-##", 4, "1204", 2],
    ["012-34", "0192-34", "0##-##", 3, "019234", 2],
    ["012-34", "55", "0##-##", 2, "055", 2],
    ["012-34", "001234", "0##-##", 6, "01234", 4],
    ["012-34", "", "0##-##", 0, "", 0],
    ["0", "00", "0##-##", 2, "00", 1],
    ["12", "120", "##0-##", 3, "120", 3],
    ["(11", "(119", "(##) 9####-####", 4, "119", 3],
    ["(11", "(118", "(##) 9####-####", 4, "1198", 3],
    ["120-34", "120-345", "##0-##", 7, "120345", 5],
    ["", "012-34", "0##-##", 6, "01234", 4],
    ["", "1234", "0##-##", 4, "01234", 4],
  ])(
    "preserves editable slots in %j → %j",
    (previous, next, mask, caret, digits, caretDigits) => {
      expect(getTelephoneMaskEdit(previous, next, mask, caret)).toEqual({
        digits,
        caretDigits,
      });
    }
  );

  it("distinguishes fixed digits, slots, overflow, and missing positions", () => {
    expect(isTelephoneDigitEditable("012-345", 0, "0##-##")).toBe(false);
    expect(isTelephoneDigitEditable("012-345", 1, "0##-##")).toBe(true);
    expect(isTelephoneDigitEditable("012-345", 3, "0##-##")).toBe(false);
    expect(isTelephoneDigitEditable("012-345", 6, "0##-##")).toBe(true);
    expect(isTelephoneDigitEditable("012-345", 7, "0##-##")).toBe(false);
    expect(getTelephoneCaretPosition("012-34", 0, "0##-##")).toBe(1);
    expect(getTelephoneCaretPosition("012-34", 1, "0##-##")).toBe(2);
    expect(getTelephoneCaretPosition("0012", 0, "00")).toBe(2);
    expect(getTelephoneCaretPosition("0012", 1, "00")).toBe(3);
  });
});

describe("telephone formatting across supported countries", () => {
  it.each([
    ["US", "2125550123", "(212) 555-0123", "212 555 0123", "212-555-0123"],
    ["CA", "4165550123", "(416) 555-0123", "416 555 0123", "416-555-0123"],
    ["GB", "2079460958", "(2079) 460-958", "2079 460 958", "2079-460-958"],
    ["FR", "123456789", "(1) 23-45-67-89", "1 23 45 67 89", "1-23-45-67-89"],
    ["FO", "242567", "(242) 567", "242 567", "242-567"],
    ["AU", "412345678", "(412) 345-678", "412 345 678", "412-345-678"],
    ["IN", "9876543210", "(98765) 43210", "98765 43210", "98765-43210"],
    ["BR", "1134567890", "(11) 3456-7890", "11 3456 7890", "11-3456-7890"],
    ["BR", "11987654321", "(11) 98765-4321", "11 98765 4321", "11-98765-4321"],
    ["MX", "5512345678", "(55) 1234-5678", "55 1234 5678", "55-1234-5678"],
    ["JP", "9012345678", "(90) 1234-5678", "90 1234 5678", "90-1234-5678"],
    ["SH", "1234", "(123) 4", "123 4", "123-4"],
    ["CK", "12345", "(123) 45", "123 45", "123-45"],
    ["DE", "3012345678", "(301) 234-5678", "301 234 5678", "301-234-5678"],
    [
      "DE",
      "3012345678901",
      "(301) 234-567-8901",
      "301 234 567 8901",
      "301-234-567-8901",
    ],
  ])(
    "matches handwritten %s fixtures for %s in every preset",
    (country, digits, parentheses, spaces, dashes) => {
      expect(formatTelephoneDigits(digits, country, "parentheses")).toBe(
        parentheses
      );
      expect(formatTelephoneDigits(digits, country, "spaces")).toBe(spaces);
      expect(formatTelephoneDigits(digits, country, "dashes")).toBe(dashes);
      expect(formatTelephoneDigits(digits, country, "digits")).toBe(digits);
    }
  );

  it.each(
    TELEPHONE_COUNTRIES.flatMap((definition) =>
      telephoneFormats.map((format) => ({
        country: definition.country,
        definition,
        format,
      }))
    )
  )(
    "preserves every digit prefix for $country in $format",
    ({ definition, format }) => {
      const { country, callingCode, maxLength } = definition;
      const placeholder = getTelephonePlaceholder(country, format);
      const sample = placeholder?.replace(/\D/g, "") ?? "";
      expect(sample.length).toBeGreaterThan(0);
      expect(sample.length).toBeLessThanOrEqual(maxLength);
      expect(sample).toMatch(/^0+$/);
      expect(sample).toBe(getTelephonePlaceholder(country, "digits"));
      expect(placeholder).toMatch(formatPatterns[format]);
      expect(formatTelephoneDigits(sample, country, format)).toBe(placeholder);

      for (let length = 0; length <= maxLength; length += 1) {
        const digits = "01234567890123".slice(0, length);
        const formatted = formatTelephoneDigits(digits, country, format);
        const context = `${country}/${format} with ${length} digits`;

        expect(formatted.replace(/\D/g, ""), context).toBe(digits);
        expect(formatted, context).toMatch(formatPatterns[format]);
        expect(formatTelephoneDigits(formatted, country, format), context).toBe(
          formatted
        );
        const full = formatTelephoneValue(callingCode, formatted);
        expect(full.replace(/\D/g, ""), context).toBe(
          digits ? callingCode + digits : ""
        );
        expect(parseTelephoneValue(full, country), context).toEqual({
          country: definition,
          callingCode,
          digits,
        });
      }
    }
  );

  it.each(TELEPHONE_COUNTRIES)(
    "keeps $country first groups consistent with its placeholder while typing",
    ({ country, maxLength }) => {
      const firstWidth =
        getTelephonePlaceholder(country)?.match(/^\((\d+)\)/)?.[1].length ?? 0;
      expect(firstWidth).toBeGreaterThan(0);

      for (const format of ["parentheses", "spaces", "dashes"] as const) {
        for (let length = 1; length <= maxLength; length += 1) {
          const digits = "01234567890123".slice(0, length);
          const formatted = formatTelephoneDigits(digits, country, format);
          const context = `${country}/${format} with ${length} digits`;
          const first = digits.slice(0, firstWidth);
          const prefix =
            format === "parentheses"
              ? `(${first}${length >= firstWidth ? ")" : ""}`
              : first;

          if (length <= firstWidth) {
            expect(formatted, context).toBe(prefix);
          } else {
            const separator = format === "dashes" ? "-" : " ";
            expect(formatted.startsWith(prefix + separator), context).toBe(
              true
            );
          }
        }
      }
    }
  );

  it.each(TELEPHONE_COUNTRIES)(
    "preserves $country digits and custom mask punctuation in every preset",
    ({ country, maxLength }) => {
      for (const mask of ["", "##.##", "(###) ###-####"]) {
        for (let length = 0; length <= maxLength; length += 1) {
          const digits = "01234567890123".slice(0, length);
          const masked = formatTelephoneDigits(digits, country, "digits", mask);
          const context = `${country}/${mask} with ${length} digits`;
          expect(masked.replace(/\D/g, ""), context).toBe(digits);
          expect(masked, context).toMatch(/^[\d(). -]*$/);
          expect(masked, context).not.toMatch(/ {2}|\.{2}|-{2}/);
          expect(masked === "" || /\d$/.test(masked), context).toBe(true);

          for (const format of telephoneFormats) {
            expect(
              formatTelephoneDigits(digits, country, format, mask),
              context
            ).toBe(masked);
            expect(
              formatTelephoneDigits(masked, country, format, mask),
              context
            ).toBe(masked);
          }
        }
      }
    }
  );
});
