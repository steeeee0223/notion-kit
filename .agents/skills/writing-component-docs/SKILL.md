---
name: writing-component-docs
description: Writes notion-kit component documentation in apps/docs/content/docs. Use when adding or updating MDX pages, RegistryStory previews, Installation blocks, TypeTable API references, registry examples, or related Fumadocs development stories.
---

# Write component docs

## Overview

Connect the component implementation, a runnable registry example, and the MDX page. Use the React Router and Fumadocs app in `apps/docs` for docs, registry pages, and development stories.

## Migration pitfalls

When asked to document a component, avoid these stale patterns:

- Use `RegistryStory`, not the removed `ComponentPreview` or its `preview` and `hideCode` props.
- Register examples in `packages/registry/src/index.ts`. The former `apps/docs/src/registry/demos.ts` and `src/__registry__` workflow no longer exists.
- Keep authored docs in `content/docs`. Regenerate `content/registry` and `content/development` instead of editing their pages.
- Use `TypeTable` for prop references. Keep comparison and data tables in Markdown.

## Find the source to edit

Use these files for each part of the page:

| Need                                 | Source to edit                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| Runnable registry example            | `packages/registry/src/<name>/<name>.tsx` and a default export in `index.ts`     |
| Registry entry                       | `registryIndex` in `packages/registry/src/index.ts`                              |
| Authored docs                        | `apps/docs/content/docs`, usually `components`, `blocks`, or the package section |
| Shared MDX components                | `apps/docs/src/components/mdx-components.tsx`                                    |
| Installation tabs                    | `apps/docs/src/components/docs/installation.tsx`                                 |
| Story generation and registry groups | `apps/docs/scripts/build-stories.ts`                                             |
| Installable registry JSON generation | `apps/docs/scripts/build-registry.ts`                                            |

Do not hand-edit these generated outputs:

- `apps/docs/content/registry/`
- `apps/docs/content/development/`
- `apps/docs/src/stories/registry.story.tsx`
- `apps/docs/public/registry/`

`apps/docs/src/stories/development.lazy.tsx` is maintained manually. It is not a generated output.

## Workflow

1. Read `apps/docs/README.md` and nearby authored pages for structure.
2. Read the component implementation, public exports, prop types, and defaults. Do not infer the API from existing docs or examples.
3. Create or reuse a registry example that renders the behavior. Keep supporting files beside the example, as the JSON builder reads that directory without recursion.
4. For a new example, add its name to `registryIndex`. Use a name that matches a group in `build-stories.ts`. If the component needs a new group, update the script's `groups` list.
5. Write MDX in this order: frontmatter, `RegistryStory`, a short usage snippet, Installation, Anatomy when useful, Examples, API reference.
6. Use a registered example name for both `RegistryStory.name` and `Installation.registryName`. Set `Installation.packages` to the packages needed for the usage snippet.
7. Describe public props with `TypeTable`. Follow the TypeTable rules below. Copy exact types, required status, and defaults from the implementation. Omit defaults the component does not define.
8. Run the checks below and inspect the affected pages in the browser.

## Write the MDX page

`RegistryStory`, `Installation`, and `TypeTable` are available through the shared MDX components. They need no per-page imports. Use fenced code blocks for usage snippets.

````mdx
---
title: Button
description: Triggers an action with mouse, touch, or keyboard input.
---

<RegistryStory name="button-default" />

```tsx
import { Button } from "@notion-kit/ui/primitives";

<Button size="md">Button</Button>;
```

## Installation

<Installation packages="@notion-kit/ui" registryName="button-default" />

## API reference

### Button

<TypeTable
	type={{
		size: {
			type: '"xs" | "sm" | "md" | "lg" | "circle" | null',
			description: "The size of the button.",
		},
	}}
/>
````

Extend the API reference to cover the component's public props. Inside `TypeTable` strings, union pipes need no escaping. Escape pipes as `\|` in Markdown tables.

### Document TypeTable props

Use `description` to explain what the prop does. Keep the displayed type in `type`.
When `type` shows a short name or alias, use `typeDescription` for the full signature.
For `React.MouseEventHandler<HTMLElement>`, set `typeDescription` to `(event: React.MouseEvent<HTMLElement>) => void`.

For function props, apply these rules:

- Add `parameters` in declaration order. Give each parameter a `name` and `description`.
- Include the parameter's type, purpose, and optionality in its description.
- For functions with no arguments, omit `parameters`.
- Add `returns` with the exact return type, including `void`, promises, and unions.
- For callback aliases, inspect the underlying signature before adding parameter and return information.
- For unions that accept a function, preserve the union in `type` or `typeDescription`. Describe the function variant with `parameters` and `returns`.

For named types, use `typeDescriptionLink` to link the displayed `type` to its reference.
This field works without `typeDescription`. It does not link the expanded `typeDescription` text.
Use the definition's page or heading anchor. Check the rendered anchor before adding the link.

For example, document a page-selection callback and link its `Page` type:

```mdx
<TypeTable
	type={{
		page: {
			type: "Page",
			typeDescriptionLink: "/docs/objects/page",
			description: "The selected page.",
		},
		onSelect: {
			type: "(page: Page) => void",
			parameters: [
				{ name: "page", description: "Page. The selected page." },
			],
			returns: "void",
			description: "Called when a page is selected.",
		},
		onClose: {
			type: "() => void",
			returns: "void",
			description: "Called when the popup closes.",
		},
	}}
/>
```

## Add a development story when needed

Use development stories for additional scenarios and editable controls. Keep installable examples in the registry.

1. Add the example to `apps/docs/src/stories/development/<path>.examples.tsx`.
2. Add its lazy import to `apps/docs/src/stories/development.lazy.tsx`.
3. Export a `defineStory(...)` call from `<path>.story.tsx`. Import `defineStory` from `@/lib/story` and the example from the shared lazy module.
4. Set `frame.src` to `/story/development/<path>/<exportName>`. Match the export name exactly.
5. Follow `apps/docs/src/stories/development/ui/input.story.tsx` for `Component`, `args.initial`, and frame dimensions.

Keep component imports in the example file. The generator imports story modules to discover their exports.

## Verify the change

Run commands from the repository root with the Node.js, pnpm, store, and sandbox settings required by `AGENTS.md`. Keep machine-specific settings out of tracked files.

If registry source changed, build the package before generating stories. The generators read the package exports:

```bash
pnpm --filter @notion-kit/registry build
pnpm --filter @notion-kit/docs build:stories
pnpm --filter @notion-kit/docs build:registry
```

Check the docs app:

```bash
pnpm --filter @notion-kit/docs typecheck
pnpm --filter @notion-kit/docs lint
pnpm --filter @notion-kit/docs format --write
pnpm --filter @notion-kit/docs build
```

The docs `dev`, `typecheck`, `lint`, and `build` scripts run `build:stories`. The docs `build` script also runs `build:registry`.

Handle generator failures at their source:

- If an entry is ungrouped, check its name and the `groups` list in `build-stories.ts`.
- If an example import is missing, check its `index.ts` default export and rebuild `@notion-kit/registry`.
- If a development story fails discovery, check its `defineStory` exports and shared lazy imports.
- If a check fails, report the command and error. Follow the diagnostics in `AGENTS.md` before changing the package-manager setup.

Before claiming the page works, open the authored `/docs/...` page and exercise its previews. Registry frames use `/story/registry/<name>/story`. Check `/registry/<group>` for new registry examples and `/development/<path>` for new development stories. For installation changes, inspect `/registry/<name>.json` after the build.

For TypeTable changes, expand the affected rows. Check parameter order, optionality, and return types against the source.
For callback aliases and function unions, check the full signature in the expanded row.
Follow each changed type link and confirm that its page and heading exist.

Confirm that previews load, controls respond, code matches the example, and installation tabs show the intended commands. Report any checks you could not run.
