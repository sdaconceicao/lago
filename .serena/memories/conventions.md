# Conventions

Authoritative detail lives in `.cursor/rules/` (`react.mdc`, `pure-functions.mdc`, `testing-unit-standards.mdc`, `storybook-stories.mdc`). Below is what is easy to get wrong.

## Components

- Functional components only. Keep render thin; extract logic to `*.utils.ts` (pure) and `*.hooks.ts`.
- Wrap RAC primitives; import **subpaths** (`react-aria-components/Button`), not the package barrel.
- Props: extend RAC types; JSDoc `@default` on visual variants.
- Classes: colocated `*.module.css` + `clsx`; shared utilities from `@/styles/base.module.css`.
- Public surface: `export *` from `src/index.ts`. Do not add a new top-level barrel unless matching existing exceptions (`FormComponents/index.ts`, `Typography/index.ts`).

## Files / naming

- Component folders PascalCase; hook files kebab-case (`use-debounced-callback.ts`).
- Tests colocated `Name.test.tsx`; stories `Name.stories.tsx`.
- Tests may use `@test-utils/*`.

## Style (Biome)

- 2-space, lineWidth 80, LF, double quotes, always semicolons, trailing commas es5, arrow parens always.
- `noExplicitAny` warn in app code, off in `*.test.{ts,tsx}`.
- Stories: `noConsole` and `useHookAtTopLevel` off.
- CSS modules: `:global` pseudo-class allowed.

## Agents

- Serena: symbols + structured edits. jCodeMunch: repo-wide exploration + `register_edit` after changes. No Grep/Glob for discovery.
