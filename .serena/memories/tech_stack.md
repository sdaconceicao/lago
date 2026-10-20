# Tech stack

- Language: TypeScript ~6, ESM (`"type": "module"`).
- UI: React 19, react-aria-components 1.x (subpath imports, e.g. `react-aria-components/Button`).
- Styling: CSS modules + `clsx`. Icons: `lucide-react`.
- Package manager: **pnpm** 10 (`packageManager` pin). Do not use npm/yarn.
- Dev: Vite 8 (`vite.config.ts` for Storybook/tests), library build via `vite.build.config.ts`.
- Tests: Vitest 4 — two projects: `unit` (jsdom, `src/**/*.{test,spec}.{ts,tsx}`) and `storybook` (Playwright Chromium, `@storybook/addon-vitest`).
- Lint/format: Biome 2 (not ESLint/Prettier).
- Docs: Storybook 10 (`pnpm storybook` → :6006).

## Library build (non-obvious)

- Entry `src/index.ts`; Rollup `preserveModules` → `dist/**/*.mjs` + `.cjs`.
- CSS merged to single `dist/index.css` (`cssCodeSplit: false`). Do not re-enable `vite-plugin-lib-inject-css` — it breaks SSR consumers.
- CSS layers (build plugin `vite.css-layers.ts`): `reset, lago.tokens, lago.base, lago.components`. Sheets that already declare `@layer lago.*` are left alone.
- Types: `vite-plugin-dts` + `@microsoft/api-extractor` (`bundleTypes: true`) → one `dist/index.d.ts`. Keep api-extractor as a **direct** devDependency or bundling is silently skipped.
- Externals: all `peerDependencies` and `dependencies` (and their subpaths).
