# Bundle size checks

The [bundle size workflow](../../.github/workflows/workflow-bundle-size.yml) checks core bundle growth on pull requests, main-branch builds, and before publishing.

## Measurement

CI uses Size Limit to bundle all core ESM exports from `dist/index.mjs`, minify them, and measure gzip size. Runtime dependencies are included; React, React DOM, and React Aria Components are excluded. The optional editor entry and stylesheet are outside this check.

Measurement settings are defined in [`.size-limit.cjs`](../../.size-limit.cjs). Measurement tools are pinned in the lockfile and both measurement jobs use Node 24.

## Growth allowance

The check fails when core growth exceeds **5%** of the latest successfully published npm release. It reports the baseline, current size, change in bytes and percent, and maximum allowed size in the job summary. The allowance is cumulative until the next release, rather than resetting for each pull request.

Missing or invalid baselines and measurement failures fail the check.

## Run locally

```sh
pnpm build
pnpm size
pnpm test:bundle-size
```

To run without network access against the initial seed, build first and supply the baseline file:

```sh
pnpm build
pnpm run size .github/bundle-size-baseline.json
```

## Release baselines

After npm publishing succeeds, CI automatically attaches `bundle-size.json` to that version's GitHub release. Subsequent checks resolve npm's `latest` version and download its matching release asset.

For the initial core/editor split only, [`.github/bundle-size-baseline.json`](../.github/bundle-size-baseline.json) seeds comparisons while npm's latest version is `0.10.0` and that release has no baseline asset. It measures the new core layout, not the old combined release. Later releases cannot fall back to this seed.

## Change the budget or measurement

To investigate an intentional budget change, edit `MAX_GROWTH_PERCENT` in [`scripts/bundle-size.mjs`](../scripts/bundle-size.mjs). Ordinary checks do not update the checked-in seed.

Changes to measurement settings must also change the measurement identifier and establish a compatible baseline.

## Recover a failed baseline upload

If saving the release asset fails after npm publishing, rerun only the failed `Save published bundle baseline` job. It uses the preserved measurement and does not republish npm.
