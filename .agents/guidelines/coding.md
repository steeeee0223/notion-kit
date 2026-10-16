# Coding Guidelines

- Merge Tailwind class names with `cn` from `@notion-kit/cn`.
- When building or changing a component, read and follow [using-primitives-for-components](../skills/using-primitives-for-components/SKILL.md).
- Validate untrusted or external data with a Zod schema and `parse` or `safeParse`; do not replace schema validation with chained `typeof` and `Array.isArray` guards.
- Never run `pnpm format`. Format with `pnpm format:fix` or `pnpm --filter <package> format --write`.
- Reuse existing `@notion-kit/*` packages and workspace-catalog dependencies before adding a dependency or duplicate utility.
- Use `@notion-kit/icons`; ask before adding another icon package.
