import { describe, expect, it } from "vitest";
import * as publicApi from "./index";

/**
 * Guards the public entry point against silently losing exports.
 *
 * `index.ts` is built almost entirely out of `export * from "..."`. When two of
 * those modules export the same name, ESM does not error and does not pick a
 * winner — the name becomes ambiguous and is dropped from the entry point
 * altogether. Declaration emit resolves ambiguity differently, so the type stays
 * in `index.d.ts` while the value disappears from the bundle: consumers get code
 * that type-checks and then throws "Export X doesn't exist in target module" at
 * runtime. That is exactly how `Header` went missing (it was re-exported by both
 * Menu and ListBox), which is why these tests exist.
 */

// Every module the entry point re-exports from, eagerly loaded so their runtime
// exports can be compared against what actually made it out.
const MODULES = import.meta.glob<Record<string, unknown>>(
  [
    "./components/**/*.ts",
    "./components/**/*.tsx",
    "./hooks/**/*.ts",
    "./providers/**/*.ts",
    "./providers/**/*.tsx",
    "!./**/*.test.ts",
    "!./**/*.test.tsx",
    "!./**/*.stories.ts",
    "!./**/*.stories.tsx",
  ],
  { eager: true }
);

// Read as text rather than through node:fs — under Vite `import.meta.url` is not
// a file: URL.
const indexSource = Object.values(
  import.meta.glob<string>("./index.ts", {
    query: "?raw",
    import: "default",
    eager: true,
  })
)[0];

/** The `./…` specifiers named by `export * from` in index.ts, in file order. */
const starExportedSpecifiers = [
  ...indexSource.matchAll(/^export \* from "(\.[^"]+)";/gm),
].map((match) => match[1]);

/** Resolve a specifier the way the bundler does, to a key in MODULES. */
function resolveModule(specifier: string) {
  const candidates = [
    `${specifier}.ts`,
    `${specifier}.tsx`,
    `${specifier}/index.ts`,
    `${specifier}/index.tsx`,
  ];
  const key = candidates.find((candidate) => candidate in MODULES);
  return key ? { key, module: MODULES[key] } : undefined;
}

/** Runtime (value) exports only — types are erased and cannot go missing. */
function valueExportsOf(module: Record<string, unknown>) {
  return Object.keys(module).filter((name) => name !== "default");
}

describe("public entry point", () => {
  it("re-exports from modules that all resolve", () => {
    expect(starExportedSpecifiers.length).toBeGreaterThan(0);

    const unresolved = starExportedSpecifiers.filter(
      (specifier) => !resolveModule(specifier)
    );
    expect(unresolved).toEqual([]);
  });

  it("has no name exported by more than one re-exported module", () => {
    const owners = new Map<string, string[]>();

    for (const specifier of starExportedSpecifiers) {
      const resolved = resolveModule(specifier);
      if (!resolved) continue;
      for (const name of valueExportsOf(resolved.module)) {
        owners.set(name, [...(owners.get(name) ?? []), specifier]);
      }
    }

    const collisions = [...owners.entries()]
      .filter(([, sources]) => sources.length > 1)
      .map(([name, sources]) => `${name} <- ${sources.join(", ")}`);

    // A collision here means the name is ALREADY missing from the bundle. Fix it
    // by exporting the name from exactly one place: give shared React Aria
    // primitives a single home (see `Header` in index.ts) and have the component
    // modules drop their copy.
    expect(collisions).toEqual([]);
  });

  it("exposes every value its re-exported modules export", () => {
    const missing: string[] = [];

    for (const specifier of starExportedSpecifiers) {
      const resolved = resolveModule(specifier);
      if (!resolved) continue;
      for (const name of valueExportsOf(resolved.module)) {
        if (!(name in publicApi)) missing.push(`${name} (from ${specifier})`);
      }
    }

    expect(missing).toEqual([]);
  });
});
