# Table grouping consistency design

## Context

The grouping menu and grouped table currently derive groups through two paths. The menu synchronizes `groupOrder` and `groupValues` from the selected plugin grouping method, while the grouped row model reads `row.getGroupingValue()`. TanStack caches the latter result on each row, so changing the grouping method can leave the table on the previous buckets even though the menu already shows the new buckets.

Date grouping also passes the empty grouping value (`null`) to the date formatter. Formatting `null` as a timestamp produces `RangeError: Invalid time value` instead of the expected `(Empty)` group.

Finally, the group-sort menu encodes both the method ID and direction into each radio value. The control's user-visible state has only three choices—manual, ascending, and descending—so parsing `${method.id}:asc` and `${method.id}:desc` adds unnecessary coupling.

## Goals

- Make the menu and grouped row model use the same current grouping method.
- Recompute all displayed buckets immediately when `group-using` changes.
- Remove buckets from the previous method instead of retaining stale groups.
- Render empty date values as `(Empty)` for every date grouping method.
- Use date-fns for all date operations under `packages/table-hook/src/fns`.
- Simplify group-sort radio values to `manual`, `ascending`, and `descending`.
- Preserve existing group sorting, ordering, visibility, and drag behavior outside these changes.

## Non-goals

- Changing plugin grouping or sorting contracts.
- Redesigning group IDs or persisted table-view state.
- Changing date grouping labels or bucket semantics.
- Refactoring unrelated table or menu code.

## Design

### Current grouping values in the row model

`extended-grouped-row-model.ts` will calculate each row's grouping value through the active column definition's `getGroupingValue` callback rather than `row.getGroupingValue()`. This bypasses TanStack's stale per-row grouping cache without reading or mutating the private `_groupingValuesCache` field.

The row model already depends on the current grouping state and pre-grouped row model. The table columns are rebuilt when `groupingMethodByColumn` changes, so the active column callback represents the newly selected method. Group IDs will continue to be produced with `createGroupId(columnId, groupingValue)`, keeping the row model aligned with `groupOrder` and `groupValues` synchronization.

As a result, switching from exact text grouping to alphabetical grouping replaces exact-value rows with initial-letter rows. Switching from `Every 1` to `Every 10` similarly replaces the old number buckets with the newly calculated intervals. No stale row-model groups survive merely because their values were cached by TanStack.

### Grouping-state synchronization

The existing synchronization path will continue rebuilding grouping entries when `groupingMethodByColumn` changes. Entries and group values are derived exclusively from the newly selected method. IDs absent from the new entry set are removed from `groupOrder`, `groupValues`, and `groupVisibility`.

If a new method independently produces an identical group ID, that ID is a valid current group rather than a stale bucket. Existing synchronization behavior may retain its order or visibility unless the method change explicitly resets order; correctness is defined by the current set of calculated group IDs and values.

### Empty date groups

`DateGroupingValue` will treat `null` as an empty grouping value and render it through `DefaultGroupingValue`. Only supported non-empty grouping keys or timestamps will be sent through date-label formatting. This guarantees `(Empty)` for blank date cells and prevents invalid-date formatting while switching among relative, day, week, month, and year grouping.

### date-fns-only date operations

All date-related operations under `packages/table-hook/src/fns` will use date-fns APIs. `@notion-kit/table-hook` will declare direct dependencies on `date-fns` and `@date-fns/tz`.

Date grouping will use `TZDate` for the configured timezone and date-fns helpers for validation, formatting, calendar boundaries, calendar differences, additions, and parsing. Hand-written logic based on `Intl.DateTimeFormat.formatToParts`, `Date.parse`, ISO slicing, weekday arithmetic, and division by day/week millisecond constants will be removed.

Date aggregation will use date-fns validity and comparison/boundary helpers for timestamp operations. Project-specific range metadata merging remains local because it is domain behavior rather than a calendar operation.

The public grouping values and ordering semantics remain unchanged:

- day: `yyyy-MM-dd`
- week: the configured week's starting day as `yyyy-MM-dd`
- month: `yyyy-MM`
- year: `yyyy`
- relative: the existing relative group names
- empty or invalid input: `null`

### Group sort control

`GroupSortControl` will expose exactly three radio values:

- `manual`
- `ascending`
- `descending`

The currently resolved eligible sorting method supplies its method ID, comparator, ascending label, and descending label. Selecting a direction writes the resolved method ID to `groupSort.method` and maps direction directly to `desc`. The control will no longer concatenate or parse a method prefix in radio values.

Plugins may register multiple sorting methods, but this control resolves one active/default group-sorting method before rendering the three state choices. The radio state represents mode and direction, not method selection.

## Error handling

- Missing, malformed, non-finite, or invalid date inputs produce the empty grouping value instead of throwing.
- An invalid stored sorting method continues to fall back through the existing method resolver.
- A grouped column without an eligible automatic sorting method continues to offer manual sorting only.
- The implementation will not mutate TanStack private caches.

## Testing

Tests will be written and observed failing before production changes.

Table-hook integration tests will verify:

- exact-to-alphabetical text method changes update actual grouped-row values and IDs;
- `Every 1` to `Every 10` number changes replace old buckets with new buckets;
- date method changes update actual grouped rows, including a single `null` empty group;
- grouping state, grouped rows, and rendered group IDs agree after each method change.

Date function tests will verify timezone boundaries, week starts, DST-adjacent relative groups, invalid inputs, empty values, and sort values using the unchanged public results. Tests tied specifically to the removed `Intl.DateTimeFormat` implementation will be replaced by behavior-level invalid-date coverage.

Table-view tests will verify:

- an empty date grouping value renders `(Empty)` without throwing for each date grouping method;
- the group-sort menu exposes manual, ascending, and descending choices with plugin-provided labels;
- direction choices update `groupSort.desc` and use the resolved method ID without method-prefixed radio values.

After focused tests pass, the affected package tests, typechecks, lint, and formatting checks will run before completion.
