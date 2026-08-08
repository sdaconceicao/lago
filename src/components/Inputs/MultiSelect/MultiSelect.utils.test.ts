import {
  addKeys,
  hasSameKeys,
  isSelectionActionKey,
  removeKeys,
  SELECT_ALL_KEY,
  SELECT_NONE_KEY,
} from "./MultiSelect.utils";

describe("MultiSelect.utils", () => {
  describe("isSelectionActionKey", () => {
    it("recognizes both control keys", () => {
      expect(isSelectionActionKey(SELECT_ALL_KEY)).toBe(true);
      expect(isSelectionActionKey(SELECT_NONE_KEY)).toBe(true);
    });

    it("rejects option keys and empty values", () => {
      expect(isSelectionActionKey("apple")).toBe(false);
      expect(isSelectionActionKey(0)).toBe(false);
      expect(isSelectionActionKey(null)).toBe(false);
      expect(isSelectionActionKey(undefined)).toBe(false);
    });
  });

  describe("addKeys", () => {
    it("returns the added keys in their own order", () => {
      expect(addKeys([], ["apple", "banana"])).toEqual(["apple", "banana"]);
    });

    it("keeps selected keys that were not added, after the added ones", () => {
      expect(addKeys(["fig"], ["apple", "banana"])).toEqual([
        "apple",
        "banana",
        "fig",
      ]);
    });

    it("does not repeat a key that is already selected", () => {
      expect(addKeys(["banana"], ["apple", "banana"])).toEqual([
        "apple",
        "banana",
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
