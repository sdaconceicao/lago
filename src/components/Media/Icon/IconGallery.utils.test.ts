import type { LucideIcon } from "lucide-react";
import {
  buildIconEntries,
  filterIcons,
  type IconEntry,
  toIconTitle,
  toImportStatement,
  toSearchTerms,
  toSearchText,
  toSlug,
} from "./IconGallery.utils";

/** Stand-ins for icon components — only their identity matters to the builder. */
const CircleAlert = (() => null) as unknown as LucideIcon;
const Building2 = (() => null) as unknown as LucideIcon;
const Grid2x2 = (() => null) as unknown as LucideIcon;

/**
 * Shaped like the `lucide-react` namespace: every name exported plainly, with an
 * `Icon` suffix and with a `Lucide` prefix, the same three ways again for the
 * names renames left behind, and a non-icon export.
 */
const moduleExports = {
  CircleAlert,
  CircleAlertIcon: CircleAlert,
  LucideCircleAlert: CircleAlert,
  AlertCircle: CircleAlert,
  AlertCircleIcon: CircleAlert,
  LucideAlertCircle: CircleAlert,
  Building2,
  Building2Icon: Building2,
  LucideBuilding2: Building2,
  Grid2x2,
  Grid2x2Icon: Grid2x2,
  LucideGrid2x2: Grid2x2,
  createLucideIcon: () => null,
};

const iconRecord = { CircleAlert, Building2, Grid2x2 };

const entries = buildIconEntries(iconRecord, moduleExports);
const entryFor = (name: string): IconEntry => {
  const entry = entries.find((candidate) => candidate.name === name);

  if (!entry) throw new Error(`No entry built for ${name}`);

  return entry;
};

describe("toSlug", () => {
  it("hyphenates camelCase names", () => {
    expect(toSlug("CircleAlert")).toBe("circle-alert");
    expect(toSlug("AlignHorizontalDistributeCenter")).toBe(
      "align-horizontal-distribute-center"
    );
  });

  it("breaks a lone leading capital off the word that follows it", () => {
    expect(toSlug("AArrowDown")).toBe("a-arrow-down");
    expect(toSlug("ALargeSmall")).toBe("a-large-small");
  });

  it("separates trailing digits from the word before them", () => {
    expect(toSlug("Building2")).toBe("building-2");
    expect(toSlug("Heading1")).toBe("heading-1");
    expect(toSlug("Columns3Cog")).toBe("columns-3-cog");
  });

  it("keeps the NxN of the grid names whole", () => {
    expect(toSlug("Grid2x2")).toBe("grid-2x2");
    expect(toSlug("Grid3x2")).toBe("grid-3x2");
    expect(toSlug("Grid2x2Check")).toBe("grid-2x2-check");
  });

  it("leaves single-word and single-letter names alone", () => {
    expect(toSlug("Accessibility")).toBe("accessibility");
    expect(toSlug("X")).toBe("x");
    expect(toSlug("")).toBe("");
  });
});

describe("toSearchTerms", () => {
  it("lowercases and splits on everything that is not alphanumeric", () => {
    expect(toSearchTerms("Circle-Alert")).toEqual(["circle", "alert"]);
    expect(toSearchTerms("arrow up  right")).toEqual(["arrow", "up", "right"]);
  });

  it("returns no terms for a query with nothing to match on", () => {
    expect(toSearchTerms("")).toEqual([]);
    expect(toSearchTerms("   ")).toEqual([]);
    expect(toSearchTerms("-·-")).toEqual([]);
  });

  it("keeps digits, which several icon names end in", () => {
    expect(toSearchTerms("Building2")).toEqual(["building2"]);
  });
});

describe("toSearchText", () => {
  it("carries the name, the slug and the aliases", () => {
    const text = toSearchText("CircleAlert", "circle-alert", ["AlertCircle"]);

    expect(text).toContain("circlealert");
    expect(text).toContain("circle-alert");
    expect(text).toContain("alertcircle");
  });

  it("appends a copy with the separators squashed out", () => {
    const text = toSearchText("ArrowUpRight", "arrow-up-right", []);

    expect(text).toBe("arrowupright arrow-up-right arrowuprightarrowupright");
  });

  it("handles an icon with no aliases", () => {
    expect(toSearchText("Bell", "bell", [])).toBe("bell bell bellbell");
  });
});

describe("toImportStatement", () => {
  it("names the icon in an import from lucide-react", () => {
    expect(toImportStatement("CircleAlert")).toBe(
      'import { CircleAlert } from "lucide-react";'
    );
  });
});

describe("toIconTitle", () => {
  it("is just the slug when the icon has never been renamed", () => {
    expect(toIconTitle(entryFor("Building2"))).toBe("building-2");
  });

  it("lists the other names the icon is exported under", () => {
    expect(toIconTitle(entryFor("CircleAlert"))).toBe(
      "circle-alert · also exported as AlertCircle"
    );
  });
});

describe("buildIconEntries", () => {
  it("builds one entry per canonical icon, sorted by name", () => {
    expect(entries.map((entry) => entry.name)).toEqual([
      "Building2",
      "CircleAlert",
      "Grid2x2",
    ]);
  });

  it("keeps each icon's component and derives its slug", () => {
    expect(entryFor("Grid2x2").Component).toBe(Grid2x2);
    expect(entryFor("Grid2x2").slug).toBe("grid-2x2");
  });

  it("collects the aliases pointing at the same component", () => {
    expect(entryFor("CircleAlert").aliases).toEqual(["AlertCircle"]);
  });

  it("drops the affixed twins of a name that is exported on its own", () => {
    const aliases = entries.flatMap((entry) => entry.aliases);

    expect(aliases).not.toContain("CircleAlertIcon");
    expect(aliases).not.toContain("AlertCircleIcon");
    expect(aliases).not.toContain("Building2Icon");
    expect(aliases).not.toContain("LucideCircleAlert");
    expect(aliases).not.toContain("LucideAlertCircle");
  });

  it("keeps an affixed alias whose bare name is not exported", () => {
    const [entry] = buildIconEntries(
      { Bell: CircleAlert },
      {
        Bell: CircleAlert,
        LegacyBellIcon: CircleAlert,
        LucideLegacyBell: CircleAlert,
      }
    );

    expect(entry.aliases).toEqual(["LegacyBellIcon", "LucideLegacyBell"]);
  });

  it("ignores exports that are not icons", () => {
    expect(entries.flatMap((entry) => entry.aliases)).not.toContain(
      "createLucideIcon"
    );
  });

  it("returns nothing for an empty icon record", () => {
    expect(buildIconEntries({}, moduleExports)).toEqual([]);
  });

  it("does not mutate its inputs and is deterministic", () => {
    const iconRecordCopy = { ...iconRecord };
    const moduleExportsCopy = { ...moduleExports };

    expect(buildIconEntries(iconRecord, moduleExports)).toEqual(
      buildIconEntries(iconRecord, moduleExports)
    );
    expect(iconRecord).toEqual(iconRecordCopy);
    expect(moduleExports).toEqual(moduleExportsCopy);
  });
});

describe("filterIcons", () => {
  it("returns every entry for a query with no terms", () => {
    expect(filterIcons(entries, "")).toBe(entries);
    expect(filterIcons(entries, "   ")).toBe(entries);
  });

  it("matches a name however it is cased or separated", () => {
    for (const query of [
      "CircleAlert",
      "circlealert",
      "circle-alert",
      "circle alert",
    ]) {
      expect(filterIcons(entries, query).map((entry) => entry.name)).toEqual([
        "CircleAlert",
      ]);
    }
  });

  it("finds an icon under the name it was renamed from", () => {
    expect(filterIcons(entries, "AlertCircle").map((e) => e.name)).toEqual([
      "CircleAlert",
    ]);
  });

  it("matches on part of a name", () => {
    expect(filterIcons(entries, "circ").map((entry) => entry.name)).toEqual([
      "CircleAlert",
    ]);
  });

  it("requires every term to match, so more terms narrow the results", () => {
    expect(filterIcons(entries, "grid 2x2").map((e) => e.name)).toEqual([
      "Grid2x2",
    ]);
    expect(filterIcons(entries, "grid bell")).toEqual([]);
  });

  it("returns nothing when a term matches nothing", () => {
    expect(filterIcons(entries, "zzz")).toEqual([]);
  });

  it("handles an empty entry list", () => {
    expect(filterIcons([], "circle")).toEqual([]);
  });
});
