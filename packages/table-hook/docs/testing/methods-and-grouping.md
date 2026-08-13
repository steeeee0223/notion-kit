# Methods, sorting, grouping, and calculation audit

## Responsibility

Protect capability resolution and the pure execution semantics used by table
rows and grouped rows. This is the source of truth for method IDs, defaults,
fallbacks, comparators, grouping keys, count aggregation, date boundaries, and
number/date formatting.

## Invariants

- Selected, default, first-registered, legacy, and unknown method paths resolve
  without throwing.
- Empty values preserve the documented ordering and grouping behavior.
- Grouped-row values are recalculated when the grouping method changes; stale
  buckets are not retained.
- Date grouping uses the configured timezone and `weekStartsOn` value.
- Group sorting reuses the grouped plugin's sorting semantics.

## Source and tests

- Method contracts and resolvers: [`src/methods.ts`](../../src/methods.ts)
- Table integration: [`use-table-view.tsx`](../../src/table-contexts/use-table-view.tsx)
- Method resolution and state integration: [`plugin-methods.test.tsx`](../../src/__tests__/plugin-methods.test.tsx)
- Sorting/grouping integration: [`sorting-grouping.test.tsx`](../../src/__tests__/sorting-grouping.test.tsx)
- Pure calculations: [`calculating.test.ts`](../../src/fns/__tests__/calculating.test.ts)
- Pure grouping: [`grouping.test.ts`](../../src/fns/__tests__/grouping.test.ts)
- Pure sorting: [`sorting.test.ts`](../../src/fns/__tests__/sorting.test.ts)

## Update this audit when

Add or update coverage when a method descriptor, resolver fallback, persisted
method state, grouping lifecycle, date boundary, or calculation formatter
changes.
