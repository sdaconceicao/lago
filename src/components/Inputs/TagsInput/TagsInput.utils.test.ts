import {
  addKey,
  CREATE_KEY,
  findItemByLabel,
  getCollectionItems,
  getCreateLabel,
  isSameKeys,
  isSameLabel,
  mergeItems,
  replaceCreateKey,
  type TagsInputItem,
} from "./TagsInput.utils";

const ITEMS: TagsInputItem[] = [
  { id: "react", label: "React" },
  { id: "css", label: "CSS" },
];

describe("isSameLabel", () => {
  it("matches identical labels", () => {
    expect(isSameLabel("React", "React")).toBe(true);
  });

  it("ignores case", () => {
    expect(isSameLabel("react", "REACT")).toBe(true);
  });

  it("ignores surrounding whitespace", () => {
    expect(isSameLabel("  React ", "React")).toBe(true);
  });

  it("does not match different labels", () => {
    expect(isSameLabel("React", "Reactive")).toBe(false);
  });

  it("does not treat inner whitespace as insignificant", () => {
    expect(isSameLabel("Node js", "Nodejs")).toBe(false);
  });
});

describe("findItemByLabel", () => {
  it("finds an item by its exact label", () => {
    expect(findItemByLabel(ITEMS, "React")).toEqual({
      id: "react",
      label: "React",
    });
  });

  it("finds an item regardless of case and whitespace", () => {
    expect(findItemByLabel(ITEMS, " css ")).toEqual({
      id: "css",
      label: "CSS",
    });
  });

  it("returns undefined for an unknown label", () => {
    expect(findItemByLabel(ITEMS, "Rust")).toBeUndefined();
  });

  it("returns undefined when there are no items", () => {
    expect(findItemByLabel([], "React")).toBeUndefined();
  });
});

describe("getCreateLabel", () => {
  it("wraps the query in quotes", () => {
    expect(getCreateLabel("Rust")).toBe("Add “Rust”");
  });

  it("keeps the query verbatim so the ComboBox filter still matches it", () => {
    // Trimming here would drop the create row the moment a trailing space was
    // typed, because React Aria filters on a "contains" test against the raw
    // input value.
    const query = "Rust ";
    expect(getCreateLabel(query)).toContain(query);
  });
});

describe("getCollectionItems", () => {
  it("returns the items unchanged when creation is off", () => {
    expect(
      getCollectionItems({ items: ITEMS, query: "Rust", allowsCreate: false })
    ).toEqual(ITEMS);
  });

  it("appends a create row for a new label", () => {
    expect(
      getCollectionItems({ items: ITEMS, query: "Rust", allowsCreate: true })
    ).toEqual([...ITEMS, { id: CREATE_KEY, label: "Rust" }]);
  });

  it("omits the create row for an empty query", () => {
    expect(
      getCollectionItems({ items: ITEMS, query: "", allowsCreate: true })
    ).toEqual(ITEMS);
  });

  it("omits the create row for a whitespace-only query", () => {
    expect(
      getCollectionItems({ items: ITEMS, query: "   ", allowsCreate: true })
    ).toEqual(ITEMS);
  });

  it("omits the create row when the query already names an item", () => {
    expect(
      getCollectionItems({ items: ITEMS, query: "react", allowsCreate: true })
    ).toEqual(ITEMS);
  });

  it("returns a new array so the collection identity tracks its contents", () => {
    const result = getCollectionItems({
      items: ITEMS,
      query: "",
      allowsCreate: true,
    });
    expect(result).not.toBe(ITEMS);
  });
});

describe("mergeItems", () => {
  it("appends created items", () => {
    expect(mergeItems(ITEMS, [{ id: "rust", label: "Rust" }])).toEqual([
      ...ITEMS,
      { id: "rust", label: "Rust" },
    ]);
  });

  it("drops a created item the caller has since added to items", () => {
    // A caller persisting onCreate items into its own `items` would otherwise
    // produce a duplicate key, which React Aria's collection cannot hold.
    expect(
      mergeItems(
        [...ITEMS, { id: "Rust", label: "Rust" }],
        [{ id: "Rust", label: "Rust" }]
      )
    ).toEqual([...ITEMS, { id: "Rust", label: "Rust" }]);
  });

  it("returns just the items when nothing was created", () => {
    expect(mergeItems(ITEMS, [])).toEqual(ITEMS);
  });
});

describe("isSameKeys", () => {
  it("matches equal key lists", () => {
    expect(isSameKeys(["a", "b"], ["a", "b"])).toBe(true);
  });

  it("does not match different lengths", () => {
    expect(isSameKeys(["a"], ["a", "b"])).toBe(false);
  });

  it("does not match a different order", () => {
    expect(isSameKeys(["a", "b"], ["b", "a"])).toBe(false);
  });

  it("matches two empty lists", () => {
    expect(isSameKeys([], [])).toBe(true);
  });
});

describe("addKey", () => {
  it("appends a new key", () => {
    expect(addKey(["a"], "b")).toEqual(["a", "b"]);
  });

  it("leaves an already selected key alone", () => {
    expect(addKey(["a", "b"], "b")).toEqual(["a", "b"]);
  });

  it("copies rather than mutating its input", () => {
    const keys = ["a"];
    expect(addKey(keys, "a")).not.toBe(keys);
  });
});

describe("replaceCreateKey", () => {
  it("swaps the synthetic key for the real one", () => {
    expect(replaceCreateKey(["a", CREATE_KEY], "rust")).toEqual(["a", "rust"]);
  });

  it("de-duplicates when the real key was already selected", () => {
    expect(replaceCreateKey(["rust", CREATE_KEY], "rust")).toEqual(["rust"]);
  });

  it("leaves a list without the synthetic key alone", () => {
    expect(replaceCreateKey(["a", "b"], "rust")).toEqual(["a", "b"]);
  });
});
