# Contributing to Lago

Lago is a React and TypeScript component library built on React Aria Components.
Inspect existing components and follow the shared standards relevant to your change.

## Development setup

Use Node.js 24 and the pnpm version specified in [`package.json`](package.json).
Use pnpm for dependency changes and include the updated `pnpm-lock.yaml` when dependencies change.

From the repository root:

```sh
pn i --frozen-lockfile
pn test:setup
pn storybook
```

`test:setup` installs the Chromium browser and dependencies used by Storybook tests.
Run it during initial setup and when the required Playwright browser version changes.
`storybook` starts the component development environment.

## Engineering standards

Shared standards live in [`docs/rules/`](docs/rules/):

- [React components](docs/rules/REACT.md)
- [Pure functions and logic extraction](docs/rules/PURE_FUNCTIONS.md)
- [Unit testing](docs/rules/TESTING_UNIT_STANDARDS.md)
- [Storybook stories and prop documentation](docs/rules/STORYBOOK_STORIES.md)

Follow the [architecture and dependency policy](docs/ARCHITECTURE.md) when changing dependencies, package exports, or the library build. It documents the rich text editor split, optional peer boundaries, and tree-shaking requirements for keeping core small.

## Validate changes

Run checks appropriate to the files changed. For code changes, the main checks are:

```sh
pn ci:validate 
pn build
```

The coverage command runs both unit and browser-based Storybook tests.
For a unit only check while developing:

```sh
pnpm exec vitest run --project unit
```

### Bundle size

See [Bundle size checks](docs/development/BUNDLE_SIZE.md) for measurement details, the growth allowance, offline checks, and release-baseline recovery.

## Pull requests

- Use a title starting with `fix:`, `feat:`, or `chore:`; CI validates the title.
- Complete the [pull request template](.github/PULL_REQUEST_TEMPLATE.md) with a summary of the change and steps to test it.
- Describe changes to public APIs or imports and any migration steps consumers need.
- Include relevant test and Storybook updates, and report checks that could not be completed.
- Resolve failing status checks before requesting a merge.
