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
- transient plugin-aware search and persisted, nested advanced filtering;
- the table-level `weekStartsOn` configuration used by date grouping.

`table-hook` does not own React cell components, menus, icons, picker controls,
or layout-specific interaction behavior. Those belong to `table-view` and may
be injected into the headless plugin factories.

## Dependency direction

The dependency direction is one-way: `table-view` may import
`@notion-kit/table-hook` and `@notion-kit/table-hook/plugins`; the headless
package must not import UI implementations from `table-view`.

## Search and advanced filtering

Search and advanced filtering have deliberately different owners:

- Search is transient TanStack state in the internal `globalFilter` atom.
  Consumers use TanStack's native `table.setGlobalFilter` and
  `table.resetGlobalFilter` methods. For every non-deleted property, search
  uses that property's plugin `toTextValue` result as its canonical text.
  Search is not persisted in the table view resource and does not invoke
  view-resource callbacks.
- Advanced filtering is persisted only as `view.filters`. The table instance
  exposes `getFilters`, `setFilters`, `clearFilters`, and `validateFilters`;
  updates use the existing controlled/uncontrolled view-resource protocol and
  emit `view.filters.change` actions.

The package entry point exports the complete UI-neutral filtering contract:

```ts
import {
  AdvancedFilteringFeature,
  evaluateTableFilter,
  getAdvancedFilteredRowModel,
  pluginTextIncludes,
  validateTableFilterState,
  type AdvancedFilteringTableApi,
  type FilterEvaluationContext,
  type FilterGroup,
  type FilterLogic,
  type FilterOperandMetadata,
  type FilterOperatorDescriptor,
  type FilterRule,
  type FilterValue,
  type TableFilterState,
} from "@notion-kit/table-hook";
```

`FilterValue` is the recursive JSON-safe operand type. Global search and
persisted advanced filters compose as an AND condition. The runtime pipeline is
global search, advanced filtering, extended grouping, then sorting and
expansion.

Built-in filter descriptors keep their stable persisted operator IDs while
providing UI-neutral operand metadata. Choice filters distinguish a single
option operand from a multiple-option operand: select uses exact membership,
while multi-select requires every selected positive option and excludes every
selected negative option. Date filters support exact calendar dates, complete
date ranges, and a dynamic `relative-to-today` operand expressed as a signed
amount and calendar unit (`day`, `week`, `month`, or `year`). Relative operands
are evaluated against the pass-wide clock in the property's timezone, so they
continue to match as time passes.

## Documentation map

- [Plugin contracts and capability policy](./plugins.md)
- [Testing audit index](./testing/README.md)
- [Resource and feature-state audit](./testing/resources-and-features.md)

When changing behavior, update the responsibility document and the linked audit
page for the affected source area in the same change.
