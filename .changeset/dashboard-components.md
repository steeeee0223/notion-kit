---
"@notion-kit/ui": minor
"@notion-kit/registry": patch
"@notion-kit/table-view": minor
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

`@notion-kit/table-view` gains three additions so it can be embedded as a
localized, read-only data table in a consumer app:

- A `messages` prop (deep-partial override of `defaultTableViewMessages`,
  typed `TableViewMessages`) localizes the toolbar, view/layout/row-peek
  menus, column and row-action menus, filter/sort/group menus, edit log, and
  generic aria labels. Every string keeps its current English default, so
  this is backwards compatible by construction.
- A `readOnly` prop (`boolean | TableViewReadOnlyOptions`) presents the table
  as `locked` (no edits, drag, or selection) while keeping search, sort, and
  filter live; it hides the toolbar "New" button, the view-settings button,
  and the footer calculation row (individually overridable). The toolbar
  "New" button also gained a working default (`table.addRow()`) or an
  optional `onNewRow` handler — it previously rendered without either.
- A row peek slot (`renderRowView`, `onRowOpen`, `openRowOnClick`) lets a
  consumer render extra content below a row's property list in the side/
  center/full peek, observe when a row opens or closes, and make the primary
  table/list rows open the peek on click or `Enter`. `defaultView.rowView`
  keeps choosing the initial peek mode.

Custom `TableUiPlugin`s already only require `renderCell` and
`renderGroupingValue`; `renderBulkEditor` and `renderConfigMenu` stay
optional, so a fully read-only cell plugin (e.g. a status badge) needs no
registry changes.
