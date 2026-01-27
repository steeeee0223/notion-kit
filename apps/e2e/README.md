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

### Visual Test (Dev Server)

```bash
pnpm -F @notion-kit/e2e dev
```

Then open [http://localhost:3001](http://localhost:3001) to see all components rendered.

### Automated Tests (Vitest)

```bash
# Run tests once
pnpm -F @notion-kit/e2e test

# Watch mode
pnpm -F @notion-kit/e2e test:watch
```

### Build Verification

```bash
pnpm -F @notion-kit/e2e build
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

1. Ensure packages are built: `pnpm build --filter=./packages/*`
2. Verify `react-compiler-runtime` is in `dependencies` (not `devDependencies`)
3. Run `pnpm install` to sync workspace dependencies
