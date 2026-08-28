# Task completion

After code changes, run from repo root. Commands in `mem:suggested_commands`.

## Local done-bar (match CI intent)

1. `pnpm check:fix` then `pnpm exec biome ci --error-on-warnings .` — CI fails on warnings, not just errors.
2. `pnpm type-check` — covers `tsconfig.app.json`, `tsconfig.node.json`, `.storybook/tsconfig.json`. CI also runs `pnpm exec tsc --noEmit` (root `tsconfig.json`); if that differs, fix to satisfy both.
3. Tests:
   - Logic/component unit work: `pnpm test --project unit` (fast).
   - Story or a11y/visual interaction: `pnpm test --project storybook` (needs `pnpm test:setup` once).
   - Before considering a PR done: `pnpm test:coverage` (both projects, what CI runs).

Skip storybook project only when the change cannot affect stories and you are iterating; do not skip it for the final check.

## Also

- New public API: `src/index.ts` export + types still emit via `pnpm build` if the change is package-surface.
- After edits, jCodeMunch `register_edit` for touched paths.
