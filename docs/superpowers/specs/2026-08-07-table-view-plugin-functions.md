# Spec: Table View Plugin Functions

Status: Hybrid architecture revised on 2026-08-09; detailed implementation plan awaiting review

## Assumptions

1. `packages/table-view/docs/plugins.md` and its two matrix images are the product requirements for this branch.
2. "Existing plugins" means the 12 plugins currently exported through `DEFAULT_PLUGINS`: title, text, number, checkbox, select, multi-select, email, phone, URL, date, created time, and last edited time.
3. The extensibility contracts already defined by `@notion-kit/table-hook` (`sorting`, `grouping`, and `counting`) remain the canonical capability and presentation API. Standard execution should use TanStack's native `sortFns`/`sortFn`, `aggregationFns`/`aggregationFn`, and `getGroupingValue` seams where possible, with inline and legacy fallbacks for config-aware or runtime plugins.
4. Existing persisted table resources and public plugin factories must remain backward compatible. A plugin that only implements the legacy `compare`, `toValue`, or `toGroupValue` fields must continue to work through the current resolver fallbacks.
5. Person, created-by, last-edited-by, ID, and status are reference behavior in the matrix, not new plugins to implement in this branch, because they do not currently exist in `packages/table-view/src/plugins`.
6. This branch covers the complete matrix, including plugin registration, selectable menu options, persisted selection state, and execution. Registering only one default function is not sufficient.

## Objective

Replace table-view's property-type-specific, fixed calculation, sorting, and grouping behavior with capabilities declared by each cell plugin and executed through TanStack-native seams coordinated by table-hook.

Plugin authors should be able to define the operations meaningful for their data type. Table-view menus should derive their available operations and labels from the selected column's plugin, and table-hook should execute the selected registered operation. Built-in plugins should expose the behavior described by `packages/table-view/docs/plugins.md` without duplicating type checks in menu components.

## Hybrid Architecture Revision

- `CellPlugin` owns capability availability, stable IDs, defaults, labels, hints, presentation formatting, and inline/legacy fallbacks.
- TanStack owns the standard row-model pipeline and the recognized `sortFns`, `aggregationFns`, `sortFn`, `aggregationFn`, and `getGroupingValue` execution boundaries.
- `table-hook` resolves capability selections, composes column definitions, selects calculation row scope, persists serializable state, and implements Notion-specific grouping lifecycle.
- `table-view` renders controls and results; it does not choose execution functions by built-in plugin type.
- No `calcFns` or `groupByFns` field is added to `TableFeatures`. TanStack v9 already provides `aggregationFns`, while grouping keys use `getGroupingValue` rather than a grouping registry.
- Built-in/common functions may use native registry references. Config-aware methods and runtime external plugins may use inline functions so static `DEFAULT_FEATURES` is not a prerequisite for extension.
- New calculations separate aggregation from presentation formatting where practical. Existing formatted counting functions remain supported through a compatibility adapter.

The primary users are:

- table users, who should only see operations valid for the selected property type;
- built-in plugin maintainers, who should define behavior next to the plugin rather than in table-view menus;
- external plugin authors, whose registered operations should work without editing table-view internals.

## In Scope

### Capability registration

- Register calculation/counting operations per built-in plugin.
- Register row sorting operations per built-in plugin.
- Register grouping-key operations per built-in plugin where the requirements define alternatives.
- Reuse each plugin's row sorting methods for automatic group ordering; do not introduce a separate family of group-sort functions.
- Preserve stable method IDs so selected methods can be persisted independently of display labels.

### Table-view consumers

- `calc-menu`: render calculation groups and methods from the current plugin rather than branching on plugin type.
- `sort-menu` and property-menu sort actions: render and select plugin-provided methods.
- `edit-group-menu`: support manual order plus the grouped plugin's registered sorting methods, and render plugin-provided grouping-key options.
- Footer calculation output, row ordering, grouped-row construction, and group ordering: resolve the selected method through table-hook.

### Built-in plugin matrix

The following is the requirements matrix transcribed from `packages/table-view/docs/plugins.md`. “Default count/percent” means:

- Count: all, values, unique values, empty, not empty.
- Percent: empty, not empty.

| Built-in plugins | Calculate | Row sort | Group sort | Grouping key |
| --- | --- | --- | --- | --- |
| title, text, email, URL, phone | Default count/percent | A→Z, Z→A | Manual, alphabetical, reverse alphabetical | Exact, alphabetical |
| select, multi-select | Default count/percent | Ascending, descending | Same choices as text | Existing/default grouping |
| checkbox | Count all/checked/unchecked; percent checked/unchecked | Checked→unchecked, unchecked→checked | None | Existing/default grouping |
| number | Default count/percent; sum, average, median, min, max, range | Low→high, high→low | Ascending, descending | User-defined numeric ranges or intervals |
| date, created time, last edited time | Default count/percent; earliest date, latest date, date range | Old→new, new→old | Oldest first, newest first | Relative, day, week, month, year |

Select and multi-select sorting uses the first selected option. Their calculation options continue using the existing generic counting policy.

The approved grouping and output semantics are:

- Text `Exact` groups by the complete value. Text `Alphabetical` groups by the case-insensitive first displayed character; empty values remain the existing `(Empty)` group, while digits and symbols use their own first character as the bucket label.
- Number grouping initially supports fixed intervals only: every 1, 10, 100, or 1000. Buckets are half-open `[start, end)`, so `100` belongs to `100–200`; negative values use the same floor-based rule. Group labels and calculation results reuse the column's number format and rounding, including percent/currency units.
- Date Day/Week/Month/Year and Relative grouping use the timezone stored in `DateConfig`. The first day of a week comes from a table-hook configuration option, defaulting to Monday. Date ranges group by `start`.
- Relative date grouping uses non-overlapping buckets evaluated in the configured timezone: Today, Yesterday, Tomorrow, This week, Last week, Next week, Earlier, and Later. The single-day buckets take precedence over week buckets.
- Date range calculation measures the span from the earliest valid `start` to the latest valid `end` (falling back to that value's `start`). Date-only values display a timezone-aware calendar-day duration; values including time display an elapsed day/hour/minute duration using at most two non-zero units. Empty input returns an empty result. Formatting lives in a shared pure utility and calculation methods continue returning strings.
- Existing empty-value ordering is preserved: empty number, select, and date values remain last in ascending row and automatic group sorting.

## Non-Goals

- Implementing plugins that do not exist in table-view today: person, created-by, last-edited-by, ID, or status.
- Redesigning plugin cell rendering, configuration menus, or property conversion.
- Adding new runtime dependencies.
- Changing unrelated table layouts or drag-and-drop behavior.
- Removing legacy plugin fields or compatibility fallbacks in the same change.
- Reproducing Notion behavior that is not explicitly defined by the source matrix or the decisions recorded in this spec.
- Implementing table filtering, including filter UI, filter state/AST, predicates, `filterFns` registrations, server filtering, or filtered row-model behavior. The plan only preserves the native future boundary and ensures calculation row scope can compose after filtering.
- Forking TanStack core or adding pseudo-native `calcFns`/`groupByFns` registry slots.

## Tech Stack

- TypeScript and React 19.
- `@tanstack/react-table` 9 for row sorting and grouping.
- Vitest and Testing Library for unit and integration tests.
- Existing `@notion-kit/table-hook`, `@notion-kit/table-view`, and `@notion-kit/ui` primitives.
- pnpm 11 workspace managed by Turborepo.

No new dependency is expected.

## Commands

Run focused checks while implementing:

```sh
pnpm --filter @notion-kit/table-hook test
pnpm --filter @notion-kit/table-view test
pnpm --filter @notion-kit/table-hook typecheck
pnpm --filter @notion-kit/table-view typecheck
pnpm --filter @notion-kit/table-hook lint
pnpm --filter @notion-kit/table-view lint
pnpm --filter @notion-kit/table-hook build
pnpm --filter @notion-kit/table-view build
```

Before completion, run repository-level affected checks if supported by the final changed-file set:

```sh
pnpm test
pnpm typecheck:affected
pnpm lint:affected
```

## Project Structure

```text
packages/table-hook/src/plugins/types.ts
  Public cell-plugin capability contracts.

packages/table-hook/src/methods.ts
  Capability method types, reusable implementations, native/inline references, and resolver fallbacks.

packages/table-hook/src/features/
  Persisted/runtime state and Notion-specific calculation/grouping orchestration.

packages/table-hook/src/table-contexts/use-table-view.tsx
  TanStack sorting, aggregation, and grouping integration, including table-level method configuration.

packages/table-hook/src/__tests__/
  Plugin method resolution and table behavior tests.

packages/table-view/src/plugins/
  Built-in plugin registrations and plugin-specific method implementations.

packages/table-view/src/menus/
  Menus that discover operations from the current column plugin.

packages/table-view/src/table-footer/
  Selected calculation presentation.

packages/table-view/src/plugins/plugins.test.tsx
  Built-in plugin contract tests.

packages/table-view/docs/plugins.md
  Source behavior matrix.
```

Tests should remain colocated according to existing package conventions. Shared operation mechanics belong in table-hook; domain-specific registrations and semantics belong with the table-view plugin.

## Code Style

Use typed capability descriptors with stable IDs and pure execution functions. Prefer shared native/common implementations where multiple plugins have identical semantics, while keeping plugin capability registration explicit. Runtime/config-aware plugins may provide inline implementations.

```ts
const alphabeticalSorting: SortingMethod = {
  id: "alphabetical",
  name: "A → Z",
  function: (rowA, rowB, colId) => {
    const a = getTextValue(rowA, colId);
    const b = getTextValue(rowB, colId);
    return a.localeCompare(b);
  },
};

export function text(): TextPlugin {
  return {
    // Existing plugin fields omitted.
    sorting: {
      defaultMethod: alphabeticalSorting.id,
      methods: [alphabeticalSorting],
    },
  };
}
```

Conventions:

- Use camelCase for functions and values, PascalCase for types, and kebab-case stable IDs.
- Keep operation functions deterministic and free of React/UI concerns.
- Do not branch on built-in plugin IDs in generic menus when the plugin descriptor can supply the same information.
- Treat empty and missing values explicitly and test their ordering/aggregation semantics.
- Preserve the repository's Prettier and ESLint formatting.

## State and Compatibility

- `useTableView` exposes a table-level `weekStartsOn` configuration with a weekday value from `0` (Sunday) through `6` (Saturday). It defaults to `1` (Monday). This is runtime table configuration, not a per-column plugin setting or persisted method ID.
- Date grouping functions receive the table method context needed to read `weekStartsOn`; date timezone remains column configuration in `DateConfig.tz`.
- Users can choose among all documented registered methods. Method selection must be represented by stable IDs in controlled table state/resource data rather than by display names or function references.
- Missing or unknown persisted method IDs must fall back deterministically to the plugin's `defaultMethod`, then its first method, then the existing legacy behavior where applicable.
- Existing resources that only store sort direction (`desc`) or a grouped column ID must continue to produce the same effective default ordering after migration.
- `compare`, `toValue`, and `toGroupValue` remain supported for external/legacy plugins during this change.
- Plugin-provided method arrays are the source of available menu options; unsupported operations should be absent rather than disabled placeholders. Execution may resolve to a native registry reference, an inline function, or a legacy fallback.
- Persist no registry/function objects. The selected stable method ID remains independent of its execution form.
- Footer calculations derive rows from TanStack's pre-grouped boundary rather than being permanently tied to `getCoreRowModel()`, so a separately planned filtering feature can compose earlier in the pipeline.

The implementation plan must identify the smallest backward-compatible resource additions required to persist row-sort, group-sort, grouping-key, and calculation method IDs.

## Testing Strategy

### Unit tests

- Verify every built-in plugin registers the expected operation IDs and groups.
- Verify new numeric calculations: sum, average, median, minimum, maximum, and range, including empty, negative, decimal, and invalid/missing values.
- Verify new date calculations: earliest, latest, and range, including empty values and date ranges.
- Verify text, numeric, boolean, select, and date row ordering at empty-value boundaries.
- Verify every grouping-key function at bucket boundaries once semantics are approved.
- Verify fixed numeric intervals at exact, negative, and empty boundaries for 1, 10, 100, and 1000.
- Verify timezone-aware date buckets around midnight, configured week boundaries (at least Sunday and Monday), month/year boundaries, and date-range starts.
- Verify date range duration formatting for date-only, date-time, range-end fallback, and empty inputs.
- Verify resolver fallback order for selected, default, first, legacy, and unknown method IDs.

### Integration tests

- Verify `calc-menu`, `sort-menu`/property menu, and `edit-group-menu` show operations from a custom plugin without table-view code changes.
- Verify selecting a method updates controlled state/resource callbacks and changes the resulting count, row order, grouping keys, or group order.
- Verify a built-in plugin does not expose operations assigned only to another plugin type.
- Verify legacy plugins without registered methods retain their current behavior.

### Regression checks

- Existing table-hook and table-view tests remain green.
- Package typechecks, lint, and builds remain green.
- No coverage percentage target is introduced; behavior added by this feature must have direct tests.

## Boundaries

### Always do

- Update this spec before implementation when an approved semantic or scope decision changes.
- Use stable method IDs and deterministic fallbacks.
- Add focused behavior and UI tests before or with each implementation slice.
- Preserve controlled-state callbacks and public plugin factory typings.
- Run relevant package tests, typechecks, lint, and builds before declaring completion.

### Ask first

- Add a dependency or change workspace/CI configuration.
- Introduce a breaking public plugin API or remove legacy fallbacks.
- Change persisted resource schemas without a backward-compatible migration/default path.
- Implement any currently absent plugin type.
- Define product semantics not resolved in this spec, particularly relative dates and numeric buckets.

### Never do

- Store function references or display labels in persisted table resources.
- Infer plugin capability from hard-coded built-in plugin IDs in generic menu code.
- Silently reinterpret missing/invalid data differently between calculation, sorting, and grouping.
- Remove failing tests or weaken assertions to make the migration pass.
- Modify or discard unrelated working-tree changes, including the untracked source documentation.

## Success Criteria

1. Each of the 12 built-in table-view plugins registers exactly the approved calculation, sorting, and grouping-key capabilities from the matrix; automatic group ordering reuses the plugin's sorting methods.
2. The named table-view menus discover their options from the selected column plugin; adding a custom plugin operation requires no table-view type switch.
3. Selecting a registered operation executes that exact operation and, where selection is persisted, survives controlled-state/resource round trips by stable ID.
4. Unsupported operations are not offered for a plugin.
5. Numeric and date calculations and grouping boundaries produce the approved deterministic results for empty, missing, negative, timezone, and exact-boundary values.
6. Existing persisted tables and legacy external plugins retain their current default sorting, grouping, and counting behavior.
7. Focused tests cover every built-in registration, resolver fallback, menu discovery path, and new operation family.
8. Both packages pass test, typecheck, lint, and build commands listed above.
9. No new runtime dependency, unrelated plugin type, or unrelated UI redesign is included.

## Decisions

- The branch implements the complete matrix, including registration, selection UI, persistence, and execution.
- Automatic group sorting reuses the grouped plugin's sorting methods; manual group ordering remains supported.
- Select and multi-select use the first option for sorting and keep the existing generic calculation policy.
- Number grouping initially exposes fixed intervals 1, 10, 100, and 1000; custom arbitrary ranges are deferred.
- Date grouping and calculation use the configured timezone, and date ranges group by start date.
- Week-based date grouping reads table-hook's `weekStartsOn` configuration (`0`–`6`), which defaults to Monday (`1`).
- Number calculation results preserve number-format units and rounding.
- Date range uses the shared duration policy defined above to balance readable UX with a pure, reusable plugin API.
- Existing empty-last ordering remains unchanged.
- The four landed commits `623251a0`, `61a299f2`, `d55a1058`, and `e1f60b4d` are retained as the migration baseline; hybrid execution changes are additive follow-up work.
- Filtering implementation remains outside this feature even though the architecture reserves TanStack's native filtering boundary.

## Open Questions

None. Any change to the decisions above reopens the Specify gate and must update this document before implementation.

## Approval Gate

The product matrix and hybrid responsibility split are reflected in `tasks/plan.md`, `tasks/todo.md`, and `tasks/test-plan.md`. T01–T04 remain the landed baseline. Remaining T05–T13 production work begins after the revised implementation details are reviewed.
