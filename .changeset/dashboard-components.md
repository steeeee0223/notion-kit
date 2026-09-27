---
"@notion-kit/ui": minor
"@notion-kit/registry": patch
---

Add generic dashboard building blocks for operator-console layouts: `StatCard`,
`Sparkline`, `TodoStack`/`TodoItem`, `EmptyState`, `PageHeader`,
`DescriptionList`/`DescriptionItem`, `ActivityFeed`/`ActivityItem`, and
`Kbd`/`KbdGroup`. Each is exported from its own `@notion-kit/ui/<name>`
subpath, themes purely through the kit's existing CSS variables (adding a new
`--green`/`--color-green` token for positive deltas and success tones
alongside the existing blue/red/orange), and works in both light and `.dark`.

Also add a `segmented` variant to `TabsList`/`TabsTrigger` for a pill-in-track
look (e.g. switching a date range), without changing the default `"line"`
variant's rendered classes.

`@notion-kit/ui`'s `package.json` now sets `"sideEffects": ["**/*.css"]` so
bundlers can tree-shake unused exports from the `primitives` barrel and the
new component subpaths. The package has no module-level side effects outside
its generated `dist/style.css` (verified by inspecting `packages/ui/src` for
top-level side-effecting calls), so marking everything else side-effect free
is safe.
