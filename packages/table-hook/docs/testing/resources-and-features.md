# Resources and feature-state audit

## Responsibility

Protect table-hook's stateful table APIs and resource boundaries: controlled and
uncontrolled updates, row/column actions, selection, freezing, counting,
group visibility/order state, transient search, and persisted advanced
filtering.

## Invariants

- Resource callbacks receive the exact next resource and action payload.
- Controlled owners remain authoritative; rejected proposals do not become
  hidden local state.
- Row and column mutations preserve positions, IDs, timestamps, and cloning
  rules. Batch cell updates and row duplication emit one resource proposal and
  ignore stale row IDs without affecting valid targets.
- Feature state updates remain serializable and compose with table resources.
- TanStack's internal `globalFilter` is transient. Native
  `setGlobalFilter`/`resetGlobalFilter` calls update searched rows without
  persisting search in the view or invoking `onViewChange`. Every non-deleted
  property contributes the canonical text returned by its plugin's
  `toTextValue`.
- `view.filters` is the sole persisted advanced-filter tree. Uncontrolled
  updates commit immediately; controlled proposals remain pending until the
  owner accepts them, and rejected proposals never become hidden local state.
  Every committed or proposed `view.filters.change` action reports the exact
  previous and next trees.
- Global search and advanced `view.filters` compose as an AND condition. The
  pipeline order is global search, advanced filtering, extended grouping, then
  sorting and expansion. Native column-filter behavior and metadata remain
  compatible with the composed row model.
- Filter trees allow three group levels. `null` and empty groups pass all rows;
  malformed trees are rejected without throwing, unknown operators and
  missing/deleted properties fail closed, and invalid built-in operands do not
  match.
- Plugin operators remain UI-neutral and cover text-like, select/multi-select,
  checkbox, number, date, and derived-date families. A single captured
  `FilterEvaluationContext.now` is reused throughout one evaluation pass.
- Root-first and leaf-first nested-row behavior remains covered at the table
  boundary. TanStack's own row-model internals are not duplicated here.

## Source and tests

- Resource ownership and controlled settlement: [`resource-api.test.tsx`](../../src/__tests__/resource-api.test.tsx)
- Filter-tree validation and pure evaluation: [`filtering.test.tsx`](../../src/__tests__/filtering.test.tsx)
- Search/filter ownership, composition, nesting, and clock context:
  [`filtering-pipeline.test.tsx`](../../src/__tests__/filtering-pipeline.test.tsx)
- Built-in plugin operator families and invalid-operand regression gates:
  [`plugins.test.ts`](../../src/plugins/plugins.test.ts)
- Date timezone and boundary utilities: [`date/utils.test.ts`](../../src/plugins/date/utils.test.ts)
- Column operations: [`columns-info.test.tsx`](../../src/__tests__/columns-info.test.tsx)
- Row operations: [`row-actions.test.tsx`](../../src/__tests__/row-actions.test.tsx)
- Row selection: [`row-selection.test.tsx`](../../src/__tests__/row-selection.test.tsx)
- Group state and visibility: [`grouping.test.tsx`](../../src/__tests__/grouping.test.tsx)
- Counting state: [`counting.test.tsx`](../../src/__tests__/counting.test.tsx)
- Column freezing: [`freezing.test.tsx`](../../src/__tests__/freezing.test.tsx)

## Coverage strategy

- Pure unit coverage protects one representative case for nested AND/OR
  evaluation, the depth and JSON-safety boundary, invalid references, and each
  built-in operator family.
- Table integration coverage protects transient search ownership, search plus
  advanced-filter composition, controlled and uncontrolled filter resources,
  root-first and leaf-first nested rows, and one shared evaluation clock.
- Builds and typecheck protect the public package surface. Tests do not repeat
  export lists or duplicate TanStack's pagination, metadata, and row-model
  implementation details.
- Filter UI interactions and server-side/manual filtering remain gaps by
  design; they belong to future `table-view` and remote-query work.

## Update this audit when

Add or update coverage when a resource action, controlled/uncontrolled boundary,
feature state shape, mutation API, or serialization rule changes.
