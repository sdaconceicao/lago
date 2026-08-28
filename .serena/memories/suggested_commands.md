# Suggested commands

Use **pnpm**. Darwin shell is standard unix; no special git/ls/grep forms.

## Daily

- Install: `pnpm install`
- Storybook: `pnpm storybook` (port 6006)
- Unit tests only: `pnpm test --project unit`
- All vitest projects (unit + storybook browser): `pnpm test`
- Watch unit: `pnpm test:watch --project unit`
- Lint: `pnpm lint` / `pnpm lint:fix`
- Format: `pnpm format` / `pnpm format:check`
- Lint+format: `pnpm check` / `pnpm check:fix`
- Types: `pnpm type-check` (app + node + storybook tsconfigs)
- Library build: `pnpm build`

## First-time / CI-like

- Playwright Chromium (required for storybook vitest project): `pnpm test:setup`
- Coverage (both projects): `pnpm test:coverage`

CI uses `pnpm exec biome ci --error-on-warnings .` (warnings fail) and `pnpm exec tsc --noEmit` (root tsconfig), not the npm script names. See `mem:task_completion`.
