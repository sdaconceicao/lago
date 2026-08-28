# lago

React design system published as `@code-x/lago`. Single package, not a monorepo.

## Source map

- `src/index.ts` — public barrel (`export *` per component/hook/provider). New public APIs must be added here.
- `src/components/<Category>/<Name>/` — UI. Categories: Actions, Collections, Expandable, Feedback, Inputs, Layout, Media, Navigation, Overlays, Typography, Visualization.
- `src/hooks/` — kebab-case files (`use-clipboard`, …).
- `src/providers/` — `theme-provider`.
- `src/styles/` — tokens (`theme.css`), `base.module.css`.
- `test-utils/` — aliased as `@test-utils/*`.
- `.storybook/` — Storybook 10 + browser vitest project.
- `.cursor/rules/` — agent coding standards (also imported from `AGENTS.md`).

Typical colocated files: `Name.tsx`, `Name.module.css`, `Name.test.tsx`, `Name.stories.tsx`, optional `Name.utils.ts` / `Name.hooks.ts` / `BaseComponents/`.

## Invariants

- Consumers must import CSS separately: `import "@code-x/lago/styles"`. JS build does **not** inject CSS (SSR-safe).
- Peers: `react` ^19, `react-dom` ^19, `react-aria-components` ^1. Do not bundle them.
- Path alias `@/*` → `src/*`.

## Further memories

- Languages, versions, build/types pipeline: `mem:tech_stack`
- Dev/test/lint commands: `mem:suggested_commands`
- File/import/style conventions: `mem:conventions`
- Commands that mean a coding task is done: `mem:task_completion`
