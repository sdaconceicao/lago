import { addKeys, hasSameKeys, removeKeys } from "./MultiSelect.utils";

describe("MultiSelect.utils", () => {
  describe("addKeys", () => {
    it("returns the added keys in their own order", () => {
      expect(addKeys([], ["apple", "banana"])).toEqual(["apple", "banana"]);
    });

    it("appends newly added keys after the existing selection", () => {
      expect(addKeys(["fig"], ["apple", "banana"])).toEqual([
        "fig",
        "apple",
        "banana",
      ]);
    });

    it("does not repeat a key that is already selected", () => {
      expect(addKeys(["banana"], ["apple", "banana"])).toEqual([
        "banana",
        "apple",
      ]);
    });

    it("returns the existing selection when there is nothing to add", () => {
      expect(addKeys(["apple"], [])).toEqual(["apple"]);
    });

    it("does not mutate its arguments", () => {
      const current = ["fig"];
      const keys = ["apple"];

      addKeys(current, keys);

      expect(current).toEqual(["fig"]);
      expect(keys).toEqual(["apple"]);
    });
  });

  describe("removeKeys", () => {
    it("removes the given keys and keeps the order of the rest", () => {
      expect(removeKeys(["apple", "banana", "fig"], ["banana"])).toEqual([
        "apple",
        "fig",
      ]);
    });

    it("ignores keys that are not selected", () => {
      expect(removeKeys(["apple"], ["banana"])).toEqual(["apple"]);
    });

    it("empties the selection when every key is removed", () => {
      expect(removeKeys(["apple", "banana"], ["apple", "banana"])).toEqual([]);
    });

    it("handles an empty selection", () => {
      expect(removeKeys([], ["apple"])).toEqual([]);
    });
  });

  describe("hasSameKeys", () => {
    it("matches lists holding the same keys in any order", () => {
      expect(hasSameKeys(["apple", "banana"], ["banana", "apple"])).toBe(true);
      expect(hasSameKeys([], [])).toBe(true);
    });

    it("does not match lists of different lengths", () => {
      expect(hasSameKeys(["apple"], ["apple", "banana"])).toBe(false);
      expect(hasSameKeys([], ["apple"])).toBe(false);
    });

    it("does not match lists of the same length holding different keys", () => {
      expect(hasSameKeys(["apple"], ["banana"])).toBe(false);
    });
  });
});
