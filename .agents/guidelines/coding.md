# Coding Guidelines

- Merge Tailwind class names with `cn` from `@notion-kit/cn`.
- When building or changing a component, read and follow [using-primitives-for-components](../skills/using-primitives-for-components/SKILL.md).
- Validate untrusted or external data with a Zod schema and `parse` or `safeParse`; do not replace schema validation with chained `typeof` and `Array.isArray` guards.
- Never run `pnpm format`. Format with `pnpm format:fix` or `pnpm --filter <package> format --write`.
- Reuse existing `@notion-kit/*` packages and workspace-catalog dependencies before adding a dependency or duplicate utility.
- Use `@notion-kit/icons`; ask before adding another icon package.

## Tests and component objects

- Call existing component/page object methods directly. Do not add test-local aliases that only forward the same arguments or rename an existing operation (for example, `setCalculation(table, ...)` wrapping `table.setCalculation(...)`).
- Reuse existing object queries and workflows instead of duplicating their selectors or interaction sequences in a spec. Keep reusable UI ownership and interactions in the corresponding component object.
- Extract a test helper only when it adds meaningful setup, data construction, synchronization, a multi-step workflow, or a shared behavioral assertion. A short function is not inherently redundant; scoped semantic queries belong in component objects.
- Keep the action and expected outcome visible in tests. Assert the behavior named by the test, including prerequisites such as a group boundary; choose an initial state that makes a missing action fail the assertion.
- Browser specs must import `test` and `expect` from the repository's `./fixtures` so automatic coverage collection runs. Import Playwright types separately.
