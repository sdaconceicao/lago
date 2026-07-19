import { filterSuggestions } from "./SearchField.utils";

const suggestions = [
  { id: "apple", label: "Apple" },
  { id: "banana", label: "Banana" },
  { id: "pineapple", label: "Pineapple" },
];

describe("filterSuggestions", () => {
  it("matches labels containing the query anywhere, case-insensitively", () => {
    const result = filterSuggestions(suggestions, "APP");

    expect(result.map((s) => s.id)).toEqual(["apple", "pineapple"]);
  });

  it("returns every suggestion for an empty query", () => {
    expect(filterSuggestions(suggestions, "")).toEqual(suggestions);
  });

  it("returns every suggestion for a whitespace-only query", () => {
    expect(filterSuggestions(suggestions, "   ")).toEqual(suggestions);
  });

  it("trims the query before matching", () => {
    const result = filterSuggestions(suggestions, "  banana  ");

    expect(result.map((s) => s.id)).toEqual(["banana"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterSuggestions(suggestions, "zzz")).toEqual([]);
  });

  it("handles an empty suggestion list", () => {
    expect(filterSuggestions([], "apple")).toEqual([]);
  });

  it("does not mutate the input and is deterministic", () => {
    const input = [...suggestions];

    const first = filterSuggestions(input, "an");
    const second = filterSuggestions(input, "an");

    expect(first).toEqual(second);
    expect(input).toEqual(suggestions);
  });
});
