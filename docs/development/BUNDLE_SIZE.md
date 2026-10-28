# Bundle size checks

The [bundle size workflow](../../.github/workflows/workflow-bundle-size.yml) checks every public core runtime export, a representative form, and the shared stylesheet on pull requests, main-branch builds, and before publishing. It also reports the size of the complete core catalog.

## Measurements

CI discovers public runtime exports by importing the built core ESM entry, `dist/index.mjs`, and automatically measures each named import. Every export receives the default 10,000-byte budget from [`scripts/bundle-size-policy.cjs`](../../scripts/bundle-size-policy.cjs), unless that policy defines an override. This includes components, hooks, helpers, providers, and constants; type-only exports have no runtime measurement. New exports need no budget configuration.

Size Limit bundles each named import, minifies it, and measures gzip size. Runtime dependencies are included; only React, React DOM, and React Aria Components are excluded. Keeping this list explicit ensures optional peer dependencies still count if they accidentally enter the core dependency graph.

| Case | Contents | Check |
| --- | --- | --- |
| Each public core runtime export | One named import and all retained dependencies | Default or overridden absolute budget and release growth |
| Representative form | `Form`, `Button`, `TextField`, `Checkbox` | Release growth |
| Shared styles | Complete `dist/index.css`, including editor styles | Release growth |
| Core exports | All core ESM exports | Report only |

A named-import budget covers the entire retained bundle after tree shaking. Internal Lago components and transitive dependencies count toward that total. Adding individual module gzip sizes does not establish the consumer's retained size.

The stylesheet is already minified by the library build and is measured directly with gzip, without a JavaScript wrapper. Optional public subpaths, such as the rich text editor, are outside the automatic core inventory and its size ceiling. Evaluate their JavaScript costs separately; their CSS remains in the shared stylesheet.

Measurement settings are defined in [`.size-limit.cjs`](../../.size-limit.cjs), with core cases generated from the discovered runtime exports. The default budget, optional overrides, growth policy, and audited legacy exceptions live in [`scripts/bundle-size-policy.cjs`](../../scripts/bundle-size-policy.cjs). Measurement tools are pinned in the lockfile and both measurement jobs use Node 24. The `pnpm size` command measures cases in batches of six to bound concurrent bundling.

## Core size ceiling

The default budget for every core runtime export is **10,000 minified gzip bytes**, configured as `defaultCoreBudget` in the policy. Here, 10 kB means 10,000 bytes, not 10 KiB. Optional `componentBudgets` overrides may set stricter limits, such as TelephoneField's 9,216-byte budget. New exports cannot receive budgets above the default ceiling.

If an export cannot fit within the ceiling, optimize its retained bundle or move the feature to a separate optional public entry following the [architecture policy](ARCHITECTURE.md#apply-the-same-boundary-to-other-large-components). Its runtime code, public types, and feature-specific dependencies must leave the core dependency graph. Optional subpaths do not inherit the core 10,000-byte ceiling.

Two runtime exports exceeded the ceiling in the audited `0.10.1` package and retain explicit legacy allowances:

| Legacy export | Published size | Absolute budget |
| --- | ---: | ---: |
| `CreditCardNumber` | 21,060 B | 24,576 B |
| `CARD_BRAND_LOGOS` | 16,160 B | 19,456 B |

These exceptions are tied to the published measurements and the explicit legacy allowances in the policy. Both still follow the release growth check. Adding a new export does not create another legacy exception.

## Growth allowance

Existing named-import cases, the representative form, and shared styles fail when growth exceeds **5%** of their sizes in the latest successfully published npm release. This allowance is cumulative until the next release; it does not reset for each pull request. Each core export must also stay within its default or overridden absolute budget, so the stricter limit applies.

A new export's absolute budget applies immediately, even while that export is absent from the published baseline. Release growth also applies after a release records the export's first measurement. Unexpected missing or invalid baselines and measurement failures fail the check.

Core exports are reported with their release baseline and change, allowing reviewers to see catalog growth as components are added. That total does not enforce the consumer growth allowance or the per-export ceiling. The shared stylesheet follows its own release growth check.

The job summary reports each case's baseline, current size, change in bytes and percent, applicable limits, and result.

## Run locally

```sh
pnpm build
pnpm size
pnpm test:bundle-size
```

Use `pnpm size` for the inventory validation and bounded measurement batches. To run without network access against the migration seed, build first and supply its path:

```sh
pnpm build
pnpm run size .github/bundle-size-baseline.json
```

This explicit local baseline does not change the latest-release baseline used by CI.

## Release baselines

After npm publishing succeeds, CI automatically attaches `bundle-size.json` to that version's GitHub release. Subsequent checks resolve npm's `latest` version and download its matching release asset. The schema version 2 manifest records a positive byte size for each named measurement under `sizes`, together with the release version and the `consumer-imports-gzip-v2` measurement identifier.

[`.github/bundle-size-baseline.json`](../../.github/bundle-size-baseline.json) is the audited migration seed measured from the published `0.10.1` npm package using the new measurement settings. It is not measured from a pull request's source. The seed includes every runtime export in that published core entry and the existing aggregate and stylesheet cases.

Automatic checks can use the seed only while npm's latest version is exactly `0.10.1` and that release has no asset or a compatible legacy version 1 asset. A legacy asset must match the seed's release version and core size. A valid version 2 release asset takes precedence. Later releases cannot fall back to this seed, and network errors are not treated as missing assets.

Ordinary checks never update the seed. Each successful publication supplies the next release baseline through its preserved measurement artifact. Extending the audited migration seed measures the published package; it does not reset the release baseline to pull request code.

## Add an export or override a budget

A new public core runtime export is discovered and measured automatically under the 10,000-byte default. Components and their exported helpers need no individual configuration. Confirm that each retained named-import bundle fits the ceiling; if it exceeds 10,000 bytes, optimize it or use the optional-entry boundary. Existing export and stylesheet checks continue to apply when adding a component.

To set a stricter limit, add an override under `componentBudgets` in [`scripts/bundle-size-policy.cjs`](../../scripts/bundle-size-policy.cjs). For example, TelephoneField uses:

```js
componentBudgets: {
  TelephoneField: 9 * 1024,
},
```

Its 9,216-byte limit applies before its first published baseline, then also follows the cumulative 5% release growth check. Overrides above 10,000 bytes are permitted only for the audited legacy exceptions listed above.

To investigate an intentional growth allowance change, edit `maxGrowthPercent` in the policy file. Changing an absolute budget preserves existing measurements and release baselines. Changing measurement settings for an existing case must also change the measurement identifier and establish a compatible baseline.

## Recover a failed baseline upload

If saving the release asset fails after npm publishing, rerun only the failed `Save published bundle baseline` job. It uses the preserved measurement and does not republish npm.
