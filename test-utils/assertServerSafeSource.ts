import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";

// Checked structurally, not by substring: these files *discuss* `"use client"`
// and react-aria in their comments, so a naive `toContain` matches the prose.
const CLIENT_ONLY_REACT_API =
  /\b(useState|useEffect|useRef|useContext|useLayoutEffect|useReducer|createContext)\b/;

export function readSiblingSource(
  filename: string,
  fromImportMetaUrl: string
): string {
  return readFileSync(
    path.join(path.dirname(fileURLToPath(fromImportMetaUrl)), filename),
    "utf8"
  );
}

/**
 * Asserts a component source file carries no client boundary — no `"use client"`
 * directive, no react-aria-components imports, and no client-only React APIs.
 */
export function assertServerSafeSource(source: string): void {
  const directive = source.trimStart().startsWith('"use client"');
  const specifiers = [...source.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
  const reactImports = [
    ...source.matchAll(/import[^;]*?from\s+"react"/gs),
  ].join("\n");

  expect(directive).toBe(false);
  expect(
    specifiers.filter((s) => s.startsWith("react-aria-components"))
  ).toEqual([]);
  expect(reactImports).not.toMatch(CLIENT_ONLY_REACT_API);
}

/** Asserts a component source file declares the `"use client"` boundary it needs. */
export function assertClientBoundary(source: string): void {
  expect(source.trimStart().startsWith('"use client"')).toBe(true);
}
