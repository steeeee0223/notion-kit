# Agent Coding Guidelines Design

## Goal

Add a short, agent-first coding-style reference and make it discoverable from the
repository root.

## Files

- `AGENTS.md` will be a minimal index. It will direct agents to read
  `.agents/guidelines/coding.md` before editing code.
- `.agents/guidelines/coding.md` will contain the repository-wide coding rules.

## Guidelines

The coding reference will use imperative, concise rules:

1. Merge Tailwind class names with `cn` from `@notion-kit/cn`.
2. When building or changing React components, follow the
   `using-primitives-for-components` skill.
3. Validate untrusted or external data with a Zod schema and `parse` or
   `safeParse`; do not replace schema validation with chained `typeof` and
   `Array.isArray` guards.
4. Never run `pnpm format`. Format with `pnpm format:fix` or
   `pnpm --filter <package> format --write`.
5. Reuse an existing `@notion-kit/*` package and workspace-catalog dependency
   before adding a new dependency or duplicate utility.
6. Use `@notion-kit/icons`; ask before adding another icon package.

## Verification

Review both files for correct relative links, concise agent-facing wording, and
the approved formatting commands. No application code or runtime behavior
changes.
