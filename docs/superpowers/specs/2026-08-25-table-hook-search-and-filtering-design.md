# Spec: table-hook searching and nested filtering

## Objective

Add client-side searching and table filtering to `@notion-kit/table-hook`.

- Searching is transient state owned only by the TanStack table instance. A later
  search UI will call TanStack's `table.setGlobalFilter`; it must not add props,
  defaults, callbacks, or persisted fields to the table-view resource.
- Filtering is a persisted view concern. It must support controlled and
  uncontrolled `view` ownership through the existing resource protocol, without
  creating a local mirror in `useTableView`.
- Filters must express AND/OR rule trees with a maximum of three group levels,
  as required by the supplied advanced-filter reference. The advanced-filter and
  search interfaces themselves are explicitly out of scope for this change.

Success means a table consumer can set an internal global search query and a
controlled or uncontrolled filter tree, then receive the correctly searched and
filtered rows before existing grouping and sorting run.

## Visual direction and scope

The updated plugin matrices establish the operator families and operand controls
that the later UI will need. `advanced-filter.png` establishes nested AND/OR
groups, rule chips, and property-specific operators. This work supplies the
headless contracts and APIs that make that UI possible; it adds no components,
menus, icons, or controls to `table-view`.

## Tech stack

- TypeScript, React 19, Vitest 4.1.8
- `@tanstack/react-table` 9.0.0
- Existing table-hook plugin capability and resource-action architecture

## Architecture

### State ownership

`TableViewState` gains one optional `filters` field. It is the sole persistent
filter representation and therefore flows through the existing `view`,
`defaultView`, `onViewChange`, `useResourceState`, and `setTableGlobalState`
path. `useTableView` derives table state from that field only; it does not call
`useState` for filters and does not maintain a synchronised `columnFilters`
array.

```ts
interface FilterRule {
  kind: "rule";
  id: string;
  propertyId: string;
  operator: string;
  value?: FilterValue;
}

interface FilterGroup {
  kind: "group";
  id: string;
  logic: "and" | "or";
  children: Array<FilterRule | FilterGroup>;
}

type TableFilterState = FilterGroup | null;
```

`FilterValue` is restricted to JSON-safe values. The root is a group; its own
depth counts toward the three-group maximum. `null` and empty groups match every
row so an incomplete future UI never hides all data. Unknown operators,
properties, or deleted properties do not match, preventing an invalid persisted
filter from showing unintended rows.

Searching uses TanStack's internal `globalFilter` atom. It is deliberately
absent from the `state` passed by `useTableView`, so TanStack owns it without a
public controlled/uncontrolled API in table-hook.

### TanStack feature integration

`DEFAULT_FEATURES` registers TanStack's `columnFilteringFeature` prerequisite,
`globalFilteringFeature`, and a filtered row-model factory. Search uses the
native `table.setGlobalFilter` / `resetGlobalFilter` APIs and a table-hook
`pluginTextIncludes` global filter function. Every non-deleted property is
eligible, and the function derives searchable text from the property plugin's
existing `toTextValue` contract rather than from renderer output or the
sorting-oriented accessor value.

TanStack column filters are intentionally not used to store advanced filters:
they are a flat AND-only array and would duplicate `view.filters`. Instead,
`AdvancedFilteringFeature` is a small table feature that exposes filter-tree
APIs and contributes the final predicate stage of the filtered row model. That
stage receives the rows already globally searched by TanStack, evaluates the
filter tree, and returns the normal TanStack row-model shape. Grouping then
receives only matching rows; sorting and expansion retain their existing order.

```text
core rows
  -> TanStack global filtering (internal search)
  -> AdvancedFilteringFeature (view.filters predicate)
  -> extended grouping
  -> sorting and expansion
```

The feature API updates filters through `setTableGlobalState` and emits a new
serializable `view.filters.change` action with the authoritative previous and
next trees. It should offer small, UI-neutral operations: read, replace, clear,
and validate a filter tree. UI-specific mutation helpers, menu state, and
operand editors remain out of scope.

### Plugin contracts

`CellPlugin` gains an optional filtering capability: an ordered set of operator
descriptors with a stable operator ID, operand requirements, JSON-safe operand
shape, and a pure matcher. The evaluator resolves a rule's plugin and operator
at runtime and invokes that matcher with the cell value, row, property config,
and operand.

The initial built-in capabilities follow the supplied matrices: text-like
operators (equality, contains, prefix/suffix, empty), select-like membership,
checkbox equality, numeric comparisons and empty checks, and date comparisons
and empty checks. The capability is headless; future table-view controls use it
to select valid operators and input widgets.

## Commands

Run commands from the repository root using the mandated Node environment:

```sh

pnpm -F @notion-kit/table-hook test
pnpm -F @notion-kit/table-hook typecheck
pnpm -F @notion-kit/table-hook lint
```

## Project structure

```text
packages/table-hook/src/features/         TanStack feature registration and new filtering feature
packages/table-hook/src/plugins/          Plugin filtering capabilities and built-in operators
packages/table-hook/src/table-contexts/   View resource types, actions, and hook integration
packages/table-hook/src/__tests__/        Resource, feature, row-model, and plugin coverage
packages/table-hook/docs/                 Responsibility and testing-audit updates
docs/superpowers/specs/                   This reviewed design specification
tasks/                                    Implementation plan and task checklist after spec approval
```

## Code style

Follow existing feature conventions: explicit interfaces, serializable action
unions, immutable updater functions, and small pure helpers. Keep feature APIs
on the table instance and resource ownership in `useTableView`.

```ts
instance.setFilters = (filters) => {
  instance.setTableGlobalState(
    (view) => ({ ...view, filters }),
    (previous, next) => ({
      id: v4(),
      type: "view.filters.change",
      payload: { previousFilters: previous.filters, nextFilters: next.filters },
    }),
  );
};
```

Do not encode UI labels, icons, React nodes, or component callbacks in the
filter state. Keep matching code outside React so tests can exercise the whole
tree without rendering a table view.

## Testing strategy

Use focused Vitest tests in `packages/table-hook/src/__tests__/` plus plugin
tests beside the relevant plugin source where that is the current convention.

- Unit-test tree validation and recursive evaluation: AND/OR short-circuiting,
  three-level boundary, empty groups, and invalid references.
- Test each built-in operator with representative values and operands,
  including date boundaries and null/empty values.
- Test the TanStack pipeline: internal global search uses `toTextValue`, then
  combines with the filter tree before grouping and sorting.
- Extend resource API tests for controlled acceptance/rejection, uncontrolled
  updates, exact `view.filters.change` payloads, and the absence of a duplicate
  local filter state.
- Run the focused test, typecheck, and lint commands above before implementation
  is considered complete.

## Boundaries

- Always: retain controlled-owner authority; use TanStack filtering features for
  global search; keep filter values serializable; validate tree depth; update
  table-hook responsibility and testing-audit documentation with the code.
- Ask first: add a dependency; change TanStack Table version; add server-side
  filtering; change the three-level nesting limit; include a search or
  advanced-filter UI in this change.
- Never: add a mirrored filter state in `useTableView`; persist search state;
  store functions or React nodes in `view.filters`; import table-view into
  table-hook; modify the user-provided PNG assets.

## Success criteria

- `table.setGlobalFilter` changes displayed rows without changing `view` or
  calling `onViewChange`.
- A filter tree can be supplied as `view.filters` or `defaultView.filters` and
  always controls the filtered rows without a local mirror.
- The public filter API emits a serializable `view.filters.change` action with
  exact previous and next tree values.
- Nested AND/OR groups evaluate correctly through three group levels, while a
  fourth level is rejected.
- Search and filtering compose as an AND condition and run before grouping and
  sorting.
- Existing data, property, grouping, sorting, selection, and view resource
  tests remain green, along with new focused coverage.

## Open questions

None. The first implementation is client-side only and supports the built-in
plugin families present in table-hook; visual controls are deferred.
