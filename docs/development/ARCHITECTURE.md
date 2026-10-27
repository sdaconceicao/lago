# Architecture

Lago's core should remain small, tree-shakeable, and usable without installing dependencies for optional components. Dependency and export boundaries must preserve that property as the library grows.

## Dependency policy

Before adding a dependency, inspect existing helpers, platform APIs, and smaller alternatives. Evaluate the code that a consuming application actually bundles, including transitive dependencies, and the packages it must install. A package's download size alone does not establish its runtime cost.

Large libraries needed by a specialized component must be isolated behind a separate public entry point with optional peer dependencies. Do not add them to core `dependencies` for that component. The component's JavaScript and public types must remain outside the core entry's dependency graph.

React, React DOM, and React Aria Components are shared, required peers. Feature-specific engines and their extensions belong to the optional component that uses them.

Every new public core runtime export must fit within an explicit budget of at most **10,000 minified gzip bytes**, including its retained Lago components and transitive dependencies. Only React, React DOM, and React Aria Components are excluded from this measurement. The ceiling applies to components, hooks, helpers, providers, and constants exposed at runtime. Type-only exports have no runtime bundle.

If a feature cannot fit within that ceiling, optimize it or isolate it behind an optional public entry, including its runtime code, public types, and feature-specific dependencies. The size ceiling supplements the dependency boundaries above. A small measured bundle does not excuse a required installation dependency for an optional feature.

`CreditCardNumber` and `CARD_BRAND_LOGOS` exceeded the ceiling in the audited published `0.10.1` core and retain legacy allowances of 24,576 and 19,456 bytes, respectively. Both remain subject to release growth checks. New exports cannot use those legacy exceptions. Optional public subpaths have independent dependency boundaries and do not inherit the core size ceiling.

## Decision: isolate the rich text editor

The rich text editor introduced Tiptap and its ProseMirror dependency graph. Including the editor in the root exports coupled the general component library to a substantial editing engine.

The editor stays in the Lago package, with a dedicated subpath:

```tsx
import { Button } from "@code-x/lago";
import { RichTextEditor } from "@code-x/lago/rich-text-editor";
import type { RichTextEditorProps } from "@code-x/lago/rich-text-editor";
import "@code-x/lago/styles";
```

The package boundary has these requirements:

- `@code-x/lago` exports core components and types without importing or re-exporting the editor or its types.
- `@code-x/lago/rich-text-editor` exposes the editor and its public types through separate ESM, CommonJS, and declaration entries.
- Tiptap packages, including `@tiptap/pm`, are optional peers and development dependencies. They are not ordinary runtime dependencies of Lago.
- Consumers install the documented, compatible editor peers explicitly. Core consumers can load and type-check Lago without Tiptap installed.
- Shared CSS continues to use the explicit `@code-x/lago/styles` import. The stylesheet currently contains both core and editor styles.

A subpath keeps one package and release process while giving the editor an explicit opt-in boundary. A separate npm package remains an option if a feature later needs independent distribution or versioning.

Optional peers change installation and version ownership. Applications that use the editor still bundle its required runtime code. The benefit for core consumers comes from isolating the dependency graph, not from renaming dependencies as peers.

See the [installation instructions](../../README.md#rich-text-editor) for the editor's peer packages and import examples.

## Apply the same boundary to other large components

When adding a component that needs a large dependency, or whose retained named-import bundle cannot fit the 10,000-byte core ceiling:

1. Add a dedicated source entry and public package subpath for the component and its types.
2. Emit independent ESM, CommonJS, and declaration entries. Keep core runtime imports and declarations free of references to the optional feature.
3. Declare every feature-specific runtime package as a peer with `peerDependenciesMeta` set to `optional: true`, and retain development copies for builds, tests, and Storybook.
4. Remove ordinary dependency paths that would still install the feature's engine. Making an engine optional while retaining a mandatory preset or extension that installs it does not establish isolation.
5. Document installation, supported peer versions, and the opt-in import. Keep coupled engine and extension versions compatible.
6. Verify both a core consumer without the optional packages and a feature consumer with the documented peers.

Import shared components directly from their implementation modules inside the library. Keep the core export barrel independent of feature entries.

## Verify dependency and export changes

Validate the packed package, not only imports from source:

- Core ESM and CommonJS imports must work without optional feature packages installed.
- Core types must compile without those packages, with `skipLibCheck: false`.
- A consumer bundle importing a small core component must exclude optional feature modules and their engines.
- The optional entry must load, type-check, and bundle with its documented peers installed.

The Size Limit checks discover every public runtime export from the built core entry and require its explicit budget in [`scripts/core-component-budgets.json`](../../scripts/core-component-budgets.json) before measuring its named import. Each retained bundle includes reachable dependencies after tree shaking and excludes only the shared React, React DOM, and React Aria peers. Keep this exclusion list explicit so moving a large library to peer dependencies cannot hide an accidental core import. The complete core export bundle is reported to show catalog growth.

The automated size gate enforces each core export's absolute budget and cumulative release growth, plus release growth for a representative form and the shared stylesheet. A new export's absolute budget applies before its first release baseline exists. Measure optional feature JavaScript separately when evaluating its dependencies; optional subpaths are outside the automatic core inventory, while the shared stylesheet already includes their CSS. See [Bundle size checks](BUNDLE_SIZE.md) for commands, the release comparison policy, export budgets, and baseline recovery.
