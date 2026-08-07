# Table View Plugin Functions Implementation Plan

Status: Approved for Phase 3 on 2026-08-07

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Phase 3 must first convert this plan into checkbox tasks in `tasks/todo.md`.

**Goal:** Make every existing table-view plugin support the approved calculation, row-sorting, group-sorting, and grouping-key matrix through registered plugin capabilities.

**Architecture:** Extend table-hook's existing plugin method descriptors with value-based sorting, runtime method context, and backward-compatible selection state. Persist only stable method IDs and serializable configuration in optional view-resource fields. Implement reusable method families beside the built-in table-view plugins, then make calculation, sorting, and grouping menus render those descriptors without property-type switches.

**Tech Stack:** TypeScript, React 19, TanStack React Table 9, Vitest, Testing Library, pnpm 11, Turborepo.

**Approved spec:** `docs/superpowers/specs/2026-08-07-table-view-plugin-functions.md`

**Test strategy:** `tasks/test-plan.md`

## Global Constraints

- Cover the 12 plugins currently exported through `DEFAULT_PLUGINS`; do not add person, created-by, last-edited-by, ID, or status plugins.
- Add no runtime dependency and make no CI/workspace configuration change.
- Persist stable IDs and serializable values only; never persist functions, React nodes, or display labels.
- Preserve legacy `compare`, `toValue`, and `toGroupValue` fallbacks.
- Preserve existing ascending empty-last behavior for number, select, multi-select, and date plugins.
- Number calculations and numeric group labels must reuse `NumberConfig.format` and `NumberConfig.round`, including currency and percent units.
- Date grouping and calculations must use `DateConfig.tz`; date ranges group by `start`.
- `weekStartsOn` accepts `0 | 1 | 2 | 3 | 4 | 5 | 6`, defaults to `1`, and is runtime table configuration rather than per-column persisted configuration.
- Follow test-driven development for each implementation slice and run focused verification before moving to a dependent slice.
- Do not modify or discard unrelated working-tree changes, including the source images under `packages/table-view/docs/`.

---

## 1. Scope Decomposition

The feature spans two packages but should remain one plan because each vertical slice requires a table-hook contract and a table-view consumer. The dependency order is:

```text
Method contracts and state ownership
  ├── Generic menu discovery
  ├── Text/select/checkbox registrations
  ├── Number calculation/grouping methods
  └── Date calculation/grouping methods
          ↓
Row sort + group sort execution
          ↓
Resource compatibility and full regression verification
```

Parallel work is safe only after the method contracts land:

- Text/select/checkbox registrations can proceed independently of number methods.
- Number method implementation can proceed independently of date methods.
- Calculation-menu work can proceed independently of group-menu work once resolver APIs are stable.
- Final resource round-trip tests and regression verification are sequential because they exercise all prior slices together.

## 2. File Responsibility Map

### Table-hook contracts and execution

- `packages/table-hook/src/methods.ts`
  - Own method descriptors, stable IDs, shared resolver order, and legacy fallbacks.
  - Add a value comparator usable by both row sorting and group sorting.
- `packages/table-hook/src/plugins/types.ts`
  - Type plugin `sorting`, `grouping`, and `counting` capabilities with their plugin data/config.
- `packages/table-hook/src/features/plugin-methods.ts` (new)
  - Own serializable selected grouping method and automatic group-sort state plus table APIs.
  - Keep method-selection mechanics out of domain plugin implementations.
- `packages/table-hook/src/features/index.ts`
  - Register and type the new feature.
- `packages/table-hook/src/features/grouping.ts`
  - Build grouping entries with the selected grouping method and order them manually or with the selected sorting method.
- `packages/table-hook/src/features/counting.ts`
  - Resolve arbitrary plugin calculation IDs without narrowing to `CountMethod`.
- `packages/table-hook/src/lib/utils.ts`
  - Execute the selected counting method and provide its registered descriptor for presentation.
- `packages/table-hook/src/table-contexts/types.ts`
  - Add `weekStartsOn` to shared table runtime options.
- `packages/table-hook/src/table-contexts/use-table-view.tsx`
  - Pass runtime config into method context and wire optional serialized method state into table state.
- `packages/table-hook/src/features/menu.ts`
  - Extend `TableViewState` only with optional, serializable plugin-method state needed for controlled view-resource round trips.
- `packages/table-hook/src/table-contexts/actions.ts`
  - Add precise view actions for persisted method selection changes.
- `packages/table-hook/src/index.ts`
  - Export the new public types and helpers.

### Table-view built-in plugin methods

- `packages/table-view/src/plugins/sorting.ts` (new)
  - Reusable text, number, checkbox, select-first-option, and date comparator descriptors and labels.
- `packages/table-view/src/plugins/text/grouping.ts` (new)
  - Exact and case-insensitive first-character grouping.
- `packages/table-view/src/plugins/number/format.ts` (new)
  - Pure number formatter extracted from `number-cell.tsx`.
- `packages/table-view/src/plugins/number/methods.ts` (new)
  - Numeric calculations and interval grouping methods.
- `packages/table-view/src/plugins/date/methods.ts` (new)
  - Date calculations, timezone bucket helpers, and grouping methods.
- `packages/table-view/src/plugins/date/utils.ts`
  - Reuse date presentation utilities and expose pure date-duration formatting where appropriate.
- Existing `plugin.tsx` files under `text`, `title`, `link`, `checkbox`, `select`, `number`, and `date`
  - Register capability descriptors; keep rendering code unchanged.
- `packages/table-view/src/plugins/utils.tsx`
  - Retain shared counting groups but remove duplicated comparator implementations after registrations migrate.
- `packages/table-view/src/plugins/index.ts`
  - Compose fully registered defaults; existing public factories remain callable and typed.

### Table-view consumers

- `packages/table-view/src/menus/calc-menu.tsx`
  - Render `plugin.counting` groups directly, with existing rich hints as optional presentation metadata.
- `packages/table-view/src/table-footer/table-footer-cell.tsx`
  - Resolve arbitrary selected method descriptors safely instead of indexing `countMethodHint` by a closed enum.
- `packages/table-view/src/menus/sort-menu.tsx`
  - Display plugin-specific ascending/descending labels and selected method controls when a plugin registers more than one comparator.
- `packages/table-view/src/menus/prop-menu.tsx`
  - Use the same resolved sorting labels/default method for header quick-sort actions.
- `packages/table-view/src/menus/edit-group-menu.tsx`
  - Expose grouping-key selection and Manual/plugin-sort group ordering.
- `packages/table-view/src/__tests__/component-objects/number-config-menu.ts`
  - Extend the existing calculation submenu helpers for arbitrary plugin groups.
- `packages/table-view/src/__tests__/component-objects/sort-menu.ts`
  - Add stable operations for plugin method and direction controls.
- `packages/table-view/src/__tests__/component-objects/grouping-menu.ts`
  - Add stable operations for grouping-method and group-order controls.

### Tests

- `packages/table-hook/src/__tests__/plugin-methods.test.tsx`
- `packages/table-hook/src/__tests__/grouping.test.tsx`
- `packages/table-hook/src/__tests__/resource-api.test.tsx`
- `packages/table-view/src/plugins/plugins.test.tsx`
- `packages/table-view/src/plugins/number/methods.test.ts` (new)
- `packages/table-view/src/plugins/number/format.test.ts` (new)
- `packages/table-view/src/plugins/date/methods.test.ts` (new)
- `packages/table-view/src/menus/calc-menu.test.tsx`
- `packages/table-view/src/menus/sort-menu.test.tsx`
- `packages/table-view/src/menus/edit-group-menu.test.tsx`
- `packages/table-view/src/menus/prop-menu.test.tsx`

## 3. Public Interfaces

The implementation should converge on these interfaces. Exact import placement may follow existing barrel conventions, but names and responsibilities should remain stable across slices.

```ts
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface PluginMethodContext<Config = unknown> {
  table: _TableInstance;
  colId: string;
  config: Config;
  weekStartsOn: Weekday;
}

export interface SortingMethod<Data = unknown, Config = unknown> {
  id: string;
  name: string;
  ascendingLabel: string;
  descendingLabel: string;
  toComparable?: (
    data: Data,
    row: Row,
    context: PluginMethodContext<Config>,
  ) => ComparableValue;
  compare: CompareFn<ComparableValue>;
  function?: (rowA: Row, rowB: Row, colId: string) => number;
}

export interface GroupingMethod<Data = unknown, Config = unknown> {
  id: string;
  name: string;
  function: (
    data: Data,
    row: Row,
    colId: string,
    context: PluginMethodContext<Config>,
  ) => ComparableValue;
  toSortValue?: (
    groupValue: ComparableValue,
    context: PluginMethodContext<Config>,
  ) => ComparableValue;
}

export interface CountingMethod {
  id: string;
  name: string;
  label?: string;
  hint?: { description: string; imageSrc?: string };
  function: (context: CountingMethodContext) => string;
}
```

Compatibility rule for `SortingMethod`: registered built-ins use `toComparable` plus `compare`; the resolver continues accepting legacy descriptors that only provide `function`. Only methods with a value comparator can be offered for automatic group sorting.

`CellPlugin.sorting` also gains `enableGroupSort?: boolean`, defaulting to `true` when a registered value comparator exists. Checkbox sets it to `false` to match the matrix. Automatic group sorting compares each grouping method's `toSortValue(groupValue)` (identity by default) with the selected sorting method's `compare`; this reuses the row-sort comparator while allowing Relative date bucket IDs to expose chronological sort keys.

Serializable selection state:

```ts
export interface PluginMethodState {
  sortingMethodByColumn: Record<string, string | undefined>;
  groupingMethodByColumn: Record<string, string | undefined>;
  groupSort:
    | { mode: "manual" }
    | { mode: "automatic"; method?: string; desc: boolean };
}

export interface TableViewState {
  // Existing fields remain unchanged.
  pluginMethods?: Partial<PluginMethodState>;
}
```

The existing TanStack `sorting` rule retains `id` and `desc`; the matrix's two row-sort options are directions of one plugin comparator. A custom plugin's selected method ID lives in `pluginMethods.sortingMethodByColumn`. This avoids changing TanStack's `ColumnSort` shape.

Table APIs:

```ts
getColumnSortingMethods(colId: string): SortingMethod[];
getSelectedSortingMethod(colId: string): SortingMethod | undefined;
setColumnSortingMethod(colId: string, methodId: string): void;

getColumnGroupingMethods(colId: string): GroupingMethod[];
getSelectedGroupingMethod(colId: string): GroupingMethod;
setColumnGroupingMethod(colId: string, methodId: string): void;

getGroupSort(): PluginMethodState["groupSort"];
setGroupSort(value: PluginMethodState["groupSort"]): void;

getColumnCountingMethod(colId: string): CountingMethod | undefined;
```

`useTableView` and the public table component accept:

```ts
weekStartsOn?: Weekday; // default: 1
```

## 4. Implementation Slices

### Slice A — Table-hook method contracts and compatibility

**Files:** `packages/table-hook/src/methods.ts`, `packages/table-hook/src/plugins/types.ts`, `packages/table-hook/src/features/plugin-methods.ts`, `packages/table-hook/src/features/index.ts`, `packages/table-hook/src/index.ts`, and `packages/table-hook/src/__tests__/plugin-methods.test.tsx`.

Start with failing tests that prove:

- selected ID wins over default ID;
- unknown selected ID falls back to default, then first method;
- legacy `compare` and legacy grouping conversion still execute;
- registered `toComparable` handles missing cells without passing `undefined` into built-in comparators;
- a method without a value comparator is not eligible for automatic group sorting;
- `weekStartsOn` defaults to `1` and accepts `0` through `6`.

Implement the interfaces above, centralize resolver order in `methods.ts`, and keep legacy signatures executable. Do not implement table-view domain semantics in table-hook.

**Focused verification:**

```sh
pnpm --filter @notion-kit/table-hook test src/__tests__/plugin-methods.test.tsx
pnpm --filter @notion-kit/table-hook typecheck
```

Expected result: both commands exit 0; compatibility tests demonstrate legacy and registered paths.

### Slice B — Method state, group execution, and resource round trips

**Files:** `packages/table-hook/src/features/plugin-methods.ts`, `packages/table-hook/src/features/grouping.ts`, `packages/table-hook/src/features/extended-grouped-row-model.ts`, `packages/table-hook/src/features/menu.ts`, `packages/table-hook/src/table-contexts/types.ts`, `packages/table-hook/src/table-contexts/use-table-view.tsx`, `packages/table-hook/src/table-contexts/actions.ts`, `packages/table-hook/src/__tests__/grouping.test.tsx`, and `packages/table-hook/src/__tests__/resource-api.test.tsx`.

Add optional `pluginMethods` to `TableViewState`. `resolveViewState` must merge nested defaults rather than overwrite them, so old partial view objects remain valid. Wire changes through `onViewChange` with explicit action types:

```ts
"view.plugin_sorting_method.change"
"view.plugin_grouping_method.change"
"view.group_sort.change"
```

Changing a grouping method must rebuild group values/order and prune visibility entries for removed group IDs. Each grouping entry records its display/group value plus the grouping method's derived sort value. Changing automatic group sort must reorder current group IDs through the selected row-sort comparator without changing group visibility. Dragging a group switches the mode to Manual before applying the dragged order. Switching back to automatic mode recomputes deterministic order from group sort values.

Test controlled and uncontrolled ownership, unknown IDs, old views without `pluginMethods`, Sunday/Monday runtime config, and no-op updates. Resource action payloads include previous/next stable IDs or modes but no derived group values.

**Focused verification:**

```sh
pnpm --filter @notion-kit/table-hook test src/__tests__/grouping.test.tsx src/__tests__/resource-api.test.tsx
pnpm --filter @notion-kit/table-hook typecheck
```

Expected result: both commands exit 0; controlled resources round-trip method selections and old fixtures retain existing behavior.

### Slice C — Generic calculation discovery and footer presentation

**Files:** `packages/table-hook/src/features/counting.ts`, `packages/table-hook/src/lib/utils.ts`, `packages/table-view/src/menus/calc-menu.tsx`, `packages/table-view/src/table-footer/table-footer-cell.tsx`, `packages/table-view/src/menus/constants.ts`, `packages/table-view/src/menus/calc-menu.test.tsx`, and `packages/table-view/src/__tests__/component-objects/number-config-menu.ts`.

Replace the type switch in `CalcMenu` with `table.getColumnPlugin(id).counting`. Preserve the `None` item and capped-count toggle. Registered method metadata supplies names and optional hints; existing `countMethodHint` content becomes metadata on built-in shared counting methods or a presentation fallback keyed safely by ID.

The footer resolves the selected descriptor through `getColumnCountingMethod`. Its short label falls back in this order: `method.label`, `method.name`, then no label. Unknown selected IDs render a stable empty/None state rather than indexing an undefined hint.

Tests use a custom plugin with a custom calculation group to prove discovery needs no menu type branch, then retain existing checkbox and generic count behavior.

**Focused verification:**

```sh
pnpm --filter @notion-kit/table-view test src/menus/calc-menu.test.tsx
pnpm --filter @notion-kit/table-hook test src/__tests__/counting.test.tsx
```

Expected result: both commands exit 0; custom, generic, and checkbox calculation choices render and execute.

### Slice D — Text-like, checkbox, and select capability registrations

**Files:** `packages/table-view/src/plugins/sorting.ts`, `packages/table-view/src/plugins/text/grouping.ts`, `packages/table-view/src/plugins/title/plugin.tsx`, `packages/table-view/src/plugins/text/plugin.tsx`, `packages/table-view/src/plugins/link/plugin.tsx`, `packages/table-view/src/plugins/checkbox/plugin.tsx`, `packages/table-view/src/plugins/select/plugin.tsx`, `packages/table-view/src/plugins/utils.tsx`, and `packages/table-view/src/plugins/plugins.test.tsx`.

Register:

- title/text/email/phone/URL: locale text comparator, A→Z/Z→A labels, Exact and Alphabetical grouping;
- checkbox: boolean comparator with Checked→unchecked/Unchecked→checked labels and existing specialized counts;
- select/multi-select: first-option comparator with Ascending/Descending labels, existing generic counts, and existing first-option grouping behavior.

Alphabetical grouping trims displayed text, returns `null` for empty, and uppercases the first displayed character with locale-aware casing. Digits and symbols return that character unchanged. Select empty arrays/null remain last when ascending.

Tests assert the exact registered IDs, labels, first-option semantics, case folding, symbol/digit buckets, empty handling, and legacy public factory return types.

**Focused verification:**

```sh
pnpm --filter @notion-kit/table-view test src/plugins/plugins.test.tsx
pnpm --filter @notion-kit/table-view typecheck
```

Expected result: both commands exit 0 and registrations match the approved matrix.

### Slice E — Number formatting, calculations, and interval grouping

**Files:** `packages/table-view/src/plugins/number/format.ts`, `packages/table-view/src/plugins/number/format.test.ts`, `packages/table-view/src/plugins/number/methods.ts`, `packages/table-view/src/plugins/number/methods.test.ts`, `packages/table-view/src/plugins/number/number-cell.tsx`, `packages/table-view/src/plugins/number/plugin.tsx`, and `packages/table-view/src/plugins/plugins.test.tsx`.

Extract the existing formatter without changing cell output:

```ts
formatNumber(value: number, config: NumberConfig): string
```

Implement stable calculation IDs `sum`, `average`, `median`, `min`, `max`, and `range`. Ignore null, missing, and non-finite values. Return an empty string when no valid numeric value exists. Define range as `max - min`. Apply the shared formatter to every numeric result so currency, percent, grouping separators, and rounding remain consistent.

Implement grouping IDs `interval-1`, `interval-10`, `interval-100`, and `interval-1000`. For interval `size`, compute `start = Math.floor(value / size) * size` and return `start` as the comparable group value. Render the group as `formatNumber(start) – formatNumber(start + size)`; this makes the upper bound exclusive and handles negative values deterministically.

Tests cover zero, decimals, negatives, exact boundaries, missing/invalid values, even/odd median, and all number formats. Snapshot-style broad assertions are avoided; assert exact strings.

**Focused verification:**

```sh
pnpm --filter @notion-kit/table-view test src/plugins/number/format.test.ts src/plugins/number/methods.test.ts src/plugins/cell-renderers.test.tsx
pnpm --filter @notion-kit/table-view typecheck
```

Expected result: commands exit 0 and existing number-cell strings remain unchanged.

### Slice F — Date calculations and timezone grouping

**Files:** `packages/table-view/src/plugins/date/methods.ts`, `packages/table-view/src/plugins/date/methods.test.ts`, `packages/table-view/src/plugins/date/utils.ts`, `packages/table-view/src/plugins/date/utils.test.ts`, `packages/table-view/src/plugins/date/plugin.tsx`, `packages/table-view/src/plugins/date/date-grouping-value.tsx`, and `packages/table-view/src/plugins/plugins.test.tsx`.

Provide one extractor per date plugin family so Date uses cell `{ start, end, includeTime }`, Created time uses `row.createdAt`, and Last edited time uses `row.lastEditedAt`.

Register calculation IDs `earliest-date`, `latest-date`, and `date-range`. Earliest compares valid starts. Latest compares valid ends with start fallback. Date range spans earliest start to latest end/start fallback. Date-only duration uses calendar-day boundaries in `DateConfig.tz`; time-aware duration uses elapsed milliseconds and emits at most two non-zero units among days, hours, and minutes. Empty input returns `""`.

Register grouping IDs `relative`, `day`, `week`, `month`, and `year`. All buckets derive local calendar parts using `DateConfig.tz`; Week uses `context.weekStartsOn`. Relative precedence is Today, Yesterday, Tomorrow, This week, Last week, Next week, Earlier, Later. Relative group values use stable bucket IDs and `toSortValue` maps them to chronological anchors for the shared date comparator. Day/week/month/year group values expose their zoned bucket-start timestamp as the sort value. Date ranges always inspect start. `DateGroupingValue` renders labels according to the selected grouping method instead of assuming every group value is a raw date timestamp.

Tests freeze the current time and cover Taipei and one DST-observing timezone, timezone midnight, Sunday/Monday week starts, month/year transitions, range-start behavior, and created/edited timestamps.

**Focused verification:**

```sh
pnpm --filter @notion-kit/table-view test src/plugins/date/methods.test.ts src/plugins/date/utils.test.ts src/plugins/plugins.test.tsx
pnpm --filter @notion-kit/table-view typecheck
```

Expected result: commands exit 0 and date outputs are deterministic under frozen time.

### Slice G — Sorting and grouping menus

**Files:** `packages/table-view/src/menus/sort-menu.tsx`, `packages/table-view/src/menus/prop-menu.tsx`, `packages/table-view/src/menus/edit-group-menu.tsx`, `packages/table-view/src/menus/sort-menu.test.tsx`, `packages/table-view/src/menus/prop-menu.test.tsx`, `packages/table-view/src/menus/edit-group-menu.test.tsx`, `packages/table-view/src/__tests__/component-objects/sort-menu.ts`, and `packages/table-view/src/__tests__/component-objects/grouping-menu.ts`.

Row sort direction labels come from the resolved sorting method. Changing a sort rule's property resets its selected method to that plugin's default and preserves direction only when valid. If a custom plugin has multiple methods, render a method selector before direction; built-ins with one method keep the current compact two-column layout.

The group menu adds:

- `Group by` property selection (existing);
- `Group using` when more than one grouping method exists;
- `Sort groups` with Manual plus eligible registered sorting methods and direction labels;
- existing hide-empty and visibility controls.

Manual group drag remains enabled only in Manual mode. Automatic mode shows deterministic order and switching modes retains visibility. Checkbox exposes no automatic group-sort item because its registration sets `sorting.enableGroupSort` to `false`; the menu contains no plugin type check.

Tests prove custom plugin method discovery, built-in labels, method selection effects, Manual switching after drag, checkbox omission, and property-menu parity.

**Focused verification:**

```sh
pnpm --filter @notion-kit/table-view test src/menus/sort-menu.test.tsx src/menus/prop-menu.test.tsx src/menus/edit-group-menu.test.tsx
pnpm --filter @notion-kit/table-hook test src/__tests__/plugin-methods.test.tsx src/__tests__/grouping.test.tsx
```

Expected result: commands exit 0; all three consumers are capability-driven.

### Slice H — Full compatibility and completion verification

**Files:** all tests touched above plus `packages/table-view/docs/plugins.md` only if implementation names differ from the approved documented stable IDs.

Run a self-audit before broad commands:

```sh
rg -n 'type === "(checkbox|number|date|select|text)"' packages/table-view/src/menus
rg -n 'countMethodHint\[method\]' packages/table-view/src
rg -n 'sorting\?\.methods|grouping\?\.methods|counting' packages/table-view/src/plugins
```

Expected results:

- no property-type capability branches remain in calculation/sorting/grouping menus;
- no unsafe arbitrary-ID lookup remains;
- every built-in plugin has explicit or helper-composed registrations.

Then run:

```sh
pnpm --filter @notion-kit/table-hook test
pnpm --filter @notion-kit/table-view test
pnpm --filter @notion-kit/table-hook typecheck
pnpm --filter @notion-kit/table-view typecheck
pnpm --filter @notion-kit/table-hook lint
pnpm --filter @notion-kit/table-view lint
pnpm --filter @notion-kit/table-hook build
pnpm --filter @notion-kit/table-view build
pnpm test
pnpm typecheck:affected
pnpm lint:affected
```

Expected result: every command exits 0. If a broad repository command exposes an unrelated pre-existing failure, record the exact command and failure without changing unrelated code; focused package checks must still pass.

## 5. Verification Checkpoints

1. **Contract checkpoint after Slice A:** public types compile, resolver fallback tests pass, and no table-view code has changed yet.
2. **State checkpoint after Slice B:** old resources work, controlled selections round-trip stable IDs, and group-order mode transitions are deterministic.
3. **Calculation checkpoint after Slices C/E/F:** generic menu discovery works and numeric/date outputs meet approved formatting semantics.
4. **Registration checkpoint after Slices D/E/F:** all 12 built-ins expose the exact matrix and no absent plugin type was introduced.
5. **UI checkpoint after Slice G:** calc/sort/prop/group menus are capability-driven and custom plugin tests pass.
6. **Completion checkpoint after Slice H:** focused and broad verification pass with no dependency or unrelated behavior changes.

## 6. Risks and Mitigations

### Controlled view-resource expansion

Risk: wiring optional plugin-method state into `TableViewState` can accidentally drop existing nested timeline fields or convert formerly uncontrolled TanStack state into stale controlled state.

Mitigation: keep selection fields nested and optional, deep-merge their defaults, test controlled/uncontrolled ownership, and emit no resource change for resolver-only fallbacks.

### Row comparator versus group comparator

Risk: legacy sorting functions accept rows and cannot sort derived group values.

Mitigation: built-ins use `toComparable + compare`; retain row-function fallback for legacy sorting only, and offer automatic group sort only for methods exposing the value comparator.

### Group identifiers changing with grouping method

Risk: switching Exact to Alphabetical changes group IDs, leaving stale visibility/order state.

Mitigation: rebuild entries atomically, preserve visibility only for surviving IDs, and reset automatic/manual order according to the selected mode.

### Timezone and current-time instability

Risk: Relative buckets can change at midnight and DST boundaries, making tests and displayed groups nondeterministic.

Mitigation: method context provides a single evaluation timestamp per regroup operation, tests use fake timers, and all calendar boundaries use the configured timezone.

### Formatting drift

Risk: cells, calculations, and number group labels could disagree after formatter extraction.

Mitigation: one pure formatter, existing cell-renderer regression tests, and exact-string tests for every format/round combination used by calculations.

### Menu complexity

Risk: adding method controls can overcrowd the existing sort and group menus.

Mitigation: hide method selectors when only one method exists, reuse current Select/Menu primitives, and keep rich calculation hints optional rather than mandatory for plugin authors.

## 7. Plan Approval Gate

After human approval of this plan and `tasks/test-plan.md`, Phase 3 creates `tasks/todo.md` with dependency-ordered tasks. Each task will name no more than approximately five production files, include acceptance criteria and an exact verification command, and use failing-test → minimal implementation → focused verification steps. Production implementation begins only after that task list is separately approved.
