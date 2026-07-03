---
name: writing-component-docs
description: Use when writing or updating notion-kit component documentation in apps/docs/content/docs, especially MDX pages with ComponentPreview, Installation, examples, API tables, or registry demos.
---

# Writing Component Docs

## Overview

Component docs must connect three sources of truth: the component implementation, a runnable registry demo, and the MDX page. If one is missing, the page may render but it is not useful.

## RED Scenario

Baseline task: "Write docs for a new component from `packages/ui/src/...`." Common failures without this skill:

- Writes only prose and API tables, with no runnable `ComponentPreview`.
- Edits generated files under `apps/docs/src/__registry__` instead of `apps/docs/src/registry/demos.ts`.
- Uses an `Installation` block without the matching `registryName`.
- Invents props from examples instead of reading exported prop types.

## Quick Reference

| Need          | Do this                                                             |
| ------------- | ------------------------------------------------------------------- |
| Preview       | Add a demo in `packages/registry/src/<demo-name>/` with `index.ts`. |
| Demo manifest | Add `<demo-name>` to `apps/docs/src/registry/demos.ts`.             |
| Page          | Add MDX under `apps/docs/content/docs/components` or `blocks`.      |
| Install block | Use `<Installation packages="..." registryName="<demo-name>" />`.   |
| API table     | Read the source component and exported types first.                 |

## Workflow

1. Read nearby docs pages for structure and tone.
2. Read the target component source and its exports.
3. Create or reuse a registry demo that renders the real behavior.
4. Add the demo name to `apps/docs/src/registry/demos.ts`; do not edit `apps/docs/src/__registry__`.
5. Write MDX in this order: frontmatter, `ComponentPreview`, Installation, Anatomy when useful, Examples, API Reference.
6. Keep examples executable-looking and short; use `hideCode` only when the preview code would distract.
7. Run registry/docs validation before claiming the page works.

## MDX Pattern

```mdx
---
title: Component Name
description: One concrete sentence about what it enables.
---

<ComponentPreview
  name="component-demo"
  preview={`<Component prop="value" />`}
/>

## Installation

<Installation packages="@notion-kit/ui" registryName="component-demo" />

## API Reference

### Component

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
```

## Common Mistakes

| Mistake                       | Fix                                                        |
| ----------------------------- | ---------------------------------------------------------- |
| Documenting props from memory | Read `*.tsx` exports and table only public props.          |
| Missing demo manifest entry   | Update `apps/docs/src/registry/demos.ts`.                  |
| Editing generated registry    | Regenerate it instead; never hand-edit `src/__registry__`. |
| Unescaped table unions        | Escape pipes in TypeScript unions as `\|`.                 |
| Over-explaining usage         | Prefer one runnable example and a focused API table.       |

## Verification

Run the most focused checks available:

```bash
pnpm --filter @notion-kit/registry build
pnpm --filter @notion-kit/docs build:registry
pnpm --filter @notion-kit/docs build
```
