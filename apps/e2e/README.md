# E2E

This test application verifies that all `@notion-kit` packages can be imported and rendered without errors when using the **built packages** (not TypeScript sources).

## Purpose

The primary goal is to ensure:

1. **React Compiler Runtime**: All packages built with the React Compiler properly include and resolve `react-compiler-runtime`.
2. **Import Resolution**: Built packages can be imported without module resolution errors.
3. **Render Validation**: Components render correctly in a real Next.js environment.

## Why This App?

- **Storybook** is for component development and documentation, not build verification.
- This dedicated app **mimics real-world usage** by importing from built `dist/` folders.
- It includes `react-compiler-runtime` as a runtime dependency, which consuming apps need.

## Running Tests

Run commands from the repository root with the repository Node and pnpm
versions:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm use 24.11.1 --silent
```

All pnpm commands below use the shared store:

```bash
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store <command>
```

### Visual Test (Dev Server)

```bash
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e dev
```

Then open [http://localhost:3001](http://localhost:3001) to see all components rendered.

### Automated Tests (Vitest)

```bash
# Run tests once
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test

# Watch mode
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test:watch
```

### Browser Tests (Playwright)

Install the pinned Chromium browser once:

```bash
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e exec playwright install chromium
```

Run the full Chromium suite:

```bash
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test:e2e
```

`pretest:e2e` builds `@notion-kit/table-view` and the production Next.js
fixture before Playwright starts. This is required because the fixture consumes
the package's built `dist/` output. Playwright serves that optimized build with
`next start`; do not run the suite against stale package output.

The Playwright HTML report is written to
`apps/e2e/playwright-report/index.html`.

### Browser Coverage

Generate the full table-view browser coverage report:

```bash
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test:e2e:coverage
```

This command has the same built-package precondition and writes:

- `apps/e2e/coverage/e2e/coverage.txt`
- `apps/e2e/coverage/e2e/coverage.json`
- `apps/e2e/coverage/e2e/index.html`

Browser coverage is informational and separate from unit-test coverage. It
tracks exercised files under `packages/table-view/src`, but it does not enforce
a percentage threshold.

### Build Verification

```bash
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e build
```

If the build succeeds, it confirms that all packages work correctly in production.

## What's Tested

### Import Tests (`import.test.ts`)

- Verifies packages can be imported dynamically
- Ensures no module resolution errors

### Render Tests (`render.test.tsx`)

- Renders components from each package
- Validates they work with React Compiler output

### Visual Test Page (`app/page.tsx`)

- Comprehensively displays all major components
- Useful for manual visual verification

## Key Dependencies

- **`react-compiler-runtime`**: Required at runtime for packages built with React Compiler
- **All `@notion-kit` packages**: Using `workspace:*` to test built versions

## Troubleshooting

If you encounter `Cannot resolve 'react/compiler-runtime'` errors:

1. Ensure packages are built: `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store build:packages`
2. Verify `react-compiler-runtime` is in `dependencies` (not `devDependencies`)
3. Run `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store install` to sync workspace dependencies
