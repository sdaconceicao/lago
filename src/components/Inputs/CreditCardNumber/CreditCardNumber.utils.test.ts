import {
  formatCardNumber,
  getCardBrand,
  getCardBrandCandidates,
  getCardBrandDefinition,
  getCardDigits,
  getCardMaxDigits,
  getCaretPositionAfterDigits,
  getMaskedMaxLength,
  isCompleteCardNumber,
  isValidCardNumber,
  passesLuhnCheck,
} from "./CreditCardNumber.utils";

describe("getCardDigits", () => {
  it("keeps only the digits", () => {
    expect(getCardDigits("4242 4242 4242 4242")).toBe("4242424242424242");
  });

  it("drops letters, punctuation, and stray whitespace", () => {
    expect(getCardDigits(" 4242-4242.abc\t4242 ")).toBe("424242424242");
  });

  it("returns an empty string for a value with no digits", () => {
    expect(getCardDigits("")).toBe("");
    expect(getCardDigits("abc")).toBe("");
  });
});

describe("getCardBrand", () => {
  it.each([
    ["4242424242424242", "visa"],
    ["4222222222222", "visa"],
    ["5555555555554444", "mastercard"],
    ["2223003122003222", "mastercard"],
    ["378282246310005", "amex"],
    ["371449635398431", "amex"],
    ["6011111111111117", "discover"],
    ["6511111111111119", "discover"],
    ["6440000000000000", "discover"],
    ["30569309025904", "diners"],
    ["36227206271667", "diners"],
    ["3095000000000000", "diners"],
    ["3566002020360505", "jcb"],
    ["6200000000000005", "unionpay"],
    ["8171999927660000", "unionpay"],
    ["6759649826438453", "maestro"],
    ["5018000000000000", "maestro"],
  ])("identifies %s as %s", (number, brand) => {
    expect(getCardBrand(number)).toBe(brand);
  });

  it("identifies the brand from a partial number", () => {
    expect(getCardBrand("4")).toBe("visa");
    expect(getCardBrand("51")).toBe("mastercard");
    expect(getCardBrand("34")).toBe("amex");
    expect(getCardBrand("35")).toBe("jcb");
  });

  it("reads through the mask", () => {
    expect(getCardBrand("4242 4242 4242 4242")).toBe("visa");
  });

  it("returns null while the digits fit more than one brand", () => {
    expect(getCardBrand("3")).toBeNull();
    expect(getCardBrand("5")).toBeNull();
    expect(getCardBrand("6")).toBeNull();
  });

  it("returns null when no brand claims the number", () => {
    expect(getCardBrand("")).toBeNull();
    expect(getCardBrand("9999999999999999")).toBeNull();
    expect(getCardBrand("abc")).toBeNull();
  });

  it("does not match a range it has grown past", () => {
    expect(getCardBrand("2720000000000000")).toBe("mastercard");
    expect(getCardBrand("2721000000000000")).toBeNull();
  });
});

describe("getCardBrandCandidates", () => {
  it("returns every brand a short number could still belong to", () => {
    expect(
      getCardBrandCandidates("6").map((definition) => definition.brand)
    ).toEqual(["discover", "unionpay", "maestro"]);
  });

  it("narrows to the brand matched on the longest prefix", () => {
    expect(
      getCardBrandCandidates("6011").map((definition) => definition.brand)
    ).toEqual(["discover"]);
  });

  it("returns nothing for an empty value", () => {
    expect(getCardBrandCandidates("")).toEqual([]);
  });

  it("returns nothing when no brand matches", () => {
    expect(getCardBrandCandidates("9")).toEqual([]);
  });
});

describe("getCardBrandDefinition", () => {
  it("returns the whole definition once the brand is settled", () => {
    expect(getCardBrandDefinition("378282246310005")).toMatchObject({
      brand: "amex",
      label: "American Express",
      lengths: [15],
      gaps: [4, 10],
    });
  });

  it("returns null while more than one brand matches", () => {
    expect(getCardBrandDefinition("6")).toBeNull();
  });
});

describe("formatCardNumber", () => {
  it("groups an unknown number in fours", () => {
    expect(formatCardNumber("9999999999999999")).toBe("9999 9999 9999 9999");
  });

  it("groups a Visa number in fours", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
  });

  it("groups an American Express number as 4-6-5", () => {
    expect(formatCardNumber("378282246310005")).toBe("3782 822463 10005");
  });

  it("groups a 14-digit Diners Club number as 4-6-4", () => {
    expect(formatCardNumber("36227206271667")).toBe("3622 720627 1667");
  });

  it("masks a partial number without a trailing space", () => {
    expect(formatCardNumber("4242")).toBe("4242");
    expect(formatCardNumber("42424")).toBe("4242 4");
  });

  it("drops every character that is not a digit", () => {
    expect(formatCardNumber("4a2b4c2-4242")).toBe("4242 4242");
  });

  it("truncates at the longest form the brand issues", () => {
    expect(formatCardNumber("3782822463100051234")).toBe("3782 822463 10005");
    expect(formatCardNumber("55555555555544449999")).toBe(
      "5555 5555 5555 4444"
    );
  });

  it("truncates an unknown number at the 19-digit maximum", () => {
    expect(formatCardNumber("99999999999999999999")).toBe(
      "9999 9999 9999 9999 999"
    );
  });

  it("groups a 19-digit number as 4-4-4-4-3", () => {
    expect(formatCardNumber("4000000000000000028")).toBe(
      "4000 0000 0000 0000 028"
    );
  });

  it("is stable when applied to an already masked value", () => {
    const once = formatCardNumber("378282246310005");

    expect(formatCardNumber(once)).toBe(once);
  });

  it("uses the definition it is given instead of detecting one", () => {
    const amex = getCardBrandDefinition("378282246310005");

    expect(formatCardNumber("999999999999999", amex)).toBe("9999 999999 99999");
  });

  it("masks with the default grouping when passed a null definition", () => {
    expect(formatCardNumber("378282246310005", null)).toBe(
      "3782 8224 6310 005"
    );
  });

  it("returns an empty string for a value with no digits", () => {
    expect(formatCardNumber("")).toBe("");
    expect(formatCardNumber("abc")).toBe("");
  });

  it("does not mutate its input", () => {
    const value = "4242424242424242";

    formatCardNumber(value);

    expect(value).toBe("4242424242424242");
  });
});

describe("getCardMaxDigits", () => {
  it("returns the longest form the brand issues", () => {
    expect(getCardMaxDigits(getCardBrandDefinition("378282246310005"))).toBe(
      15
    );
    expect(getCardMaxDigits(getCardBrandDefinition("4242424242424242"))).toBe(
      19
    );
  });

  it("falls back to the 19-digit maximum for an unknown brand", () => {
    expect(getCardMaxDigits(null)).toBe(19);
  });
});

describe("getMaskedMaxLength", () => {
  it("counts the group separators the mask adds", () => {
    expect(getMaskedMaxLength(getCardBrandDefinition("378282246310005"))).toBe(
      17
    );
    expect(getMaskedMaxLength(null)).toBe(23);
  });
});

describe("isCompleteCardNumber", () => {
  it("accepts every length the brand issues", () => {
    expect(isCompleteCardNumber("4242424242424242")).toBe(true);
    expect(isCompleteCardNumber("4222222222222")).toBe(true);
    expect(isCompleteCardNumber("378282246310005")).toBe(true);
  });

  it("rejects a length the brand does not issue", () => {
    expect(isCompleteCardNumber("42424242424242")).toBe(false);
    expect(isCompleteCardNumber("37828224631000")).toBe(false);
  });

  it("accepts any plausible length while the brand is unknown", () => {
    expect(isCompleteCardNumber("999999999999")).toBe(true);
    expect(isCompleteCardNumber("99999999999")).toBe(false);
  });

  it("rejects an empty value", () => {
    expect(isCompleteCardNumber("")).toBe(false);
  });
});

describe("passesLuhnCheck", () => {
  it.each([
    "4242 4242 4242 4242",
    "5555555555554444",
    "378282246310005",
    "6011111111111117",
    "3566002020360505",
    "6200000000000005",
    "36227206271667",
  ])("accepts %s", (number) => {
    expect(passesLuhnCheck(number)).toBe(true);
  });

  it("rejects a number with a mistyped digit", () => {
    expect(passesLuhnCheck("4242424242424241")).toBe(false);
  });

  it("rejects a number with two digits transposed", () => {
    expect(passesLuhnCheck("4111111111111112")).toBe(false);
  });

  it("rejects an empty value", () => {
    expect(passesLuhnCheck("")).toBe(false);
    expect(passesLuhnCheck("abc")).toBe(false);
  });
});

describe("isValidCardNumber", () => {
  it("accepts a complete number with a valid checksum", () => {
    expect(isValidCardNumber("4242 4242 4242 4242")).toBe(true);
    expect(isValidCardNumber("3782 822463 10005")).toBe(true);
  });

  it("rejects a complete number with an invalid checksum", () => {
    expect(isValidCardNumber("4242424242424243")).toBe(false);
  });

  it("rejects a number that is the wrong length for its brand", () => {
    expect(isValidCardNumber("42424242424242")).toBe(false);
  });

  it("rejects an empty value", () => {
    expect(isValidCardNumber("")).toBe(false);
  });
});

describe("getCaretPositionAfterDigits", () => {
  it("returns the offset just after the nth digit", () => {
    expect(getCaretPositionAfterDigits("4242 4242", 4)).toBe(4);
    expect(getCaretPositionAfterDigits("4242 4242", 5)).toBe(6);
    expect(getCaretPositionAfterDigits("4242 4242", 8)).toBe(9);
  });

  it("returns the start of the value for a caret before any digit", () => {
    expect(getCaretPositionAfterDigits("4242 4242", 0)).toBe(0);
    expect(getCaretPositionAfterDigits("4242 4242", -1)).toBe(0);
  });

  it("clamps to the end when the value holds fewer digits", () => {
    expect(getCaretPositionAfterDigits("4242", 9)).toBe(4);
    expect(getCaretPositionAfterDigits("", 3)).toBe(0);
  });
});
