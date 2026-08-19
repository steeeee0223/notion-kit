# `@notion-kit/table-hook` documentation

`table-hook` is the headless table engine. It defines the data and plugin
contracts consumed by a table implementation, executes table behavior, and
coordinates serializable table resources with TanStack Table.

## Responsibility

`table-hook` owns:

- `CellPlugin` contracts and the public `@notion-kit/table-hook/plugins`
  factories, including required `renderCellValue` and optional
  `renderCellEditor` capabilities;
- property defaults, conversion, transfer, comparison, grouping, counting,
  and sorting semantics;
- capability descriptors, stable method IDs, resolver fallbacks, and legacy
  compatibility;
- pure date/number/grouping/calculation utilities;
- table features and resource/state transitions, including controlled and
  uncontrolled updates;
- the table-level `weekStartsOn` configuration used by date grouping.

`table-hook` does not own React cell components, menus, icons, picker controls,
or layout-specific interaction behavior. Those belong to `table-view` and may
be injected into the headless plugin factories.

## Dependency direction

The dependency direction is one-way: `table-view` may import
`@notion-kit/table-hook` and `@notion-kit/table-hook/plugins`; the headless
package must not import UI implementations from `table-view`.

## Documentation map

- [Plugin contracts and capability policy](./plugins.md)
- [Testing audit index](./testing/README.md)

When changing behavior, update the responsibility document and the linked audit
page for the affected source area in the same change.
