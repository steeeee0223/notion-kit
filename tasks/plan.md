# Table View Plugin Functions — Hybrid Implementation Plan

Status: Approved on 2026-08-10; T01–T09 complete

> Implementation workers must use `subagent-driven-development` or `executing-plans`, follow the dependency order in `tasks/todo.md`, and use test-driven development for each remaining slice.

## 1. Goal

Implement the calculation, row-sorting, group-sorting, and grouping-key matrix for the 12 existing table-view plugins while keeping the public architecture close to TanStack Table and preserving Notion-style product behavior.

The revised approach is hybrid:

- `CellPlugin` declares supported capabilities, stable IDs, defaults, and UI metadata.
- TanStack Table owns its standard execution pipeline and native extension points.
- `table-hook` resolves selected plugin capabilities, adapts them to TanStack, and owns serializable view state plus Notion-specific grouping behavior.
- `table-view` renders menus and results from the resolved capability model without plugin-type switches.

This plan does **not** add `calcFns` or `groupByFns` to `TableFeatures`. TanStack v9 already provides `aggregationFns` for aggregation and uses `getGroupingValue` for grouping keys.

## 2. Scope

### In scope

- Complete the documented function matrix for title, text, number, checkbox, select, multi-select, email, phone, URL, date, created time, and last edited time.
- Publish reusable built-in sorting, grouping-key, and calculation functions from the dedicated `@notion-kit/table-hook/fns` subpath.
- Keep stable method IDs and backward-compatible resolver fallbacks.
- Use TanStack-native boundaries where they exist:
  - sorting: `sortFns` / `ColumnDef.sortFn`;
  - calculations: `aggregationFns` / `ColumnDef.aggregationFn` / column aggregation APIs;
  - grouping keys: `ColumnDef.getGroupingValue`;
  - row-model order: core → filtered → grouped → sorted → expanded.
- Allow an inline function fallback for config-aware methods, runtime external plugins, and legacy plugin contracts.
- Keep Notion-specific group visibility, manual order, automatic group order, grouping-key selection, and resource round trips in `table-hook`.
- Keep calculation/sort/group menus capability-driven.

### Explicitly out of scope

- Implementing table filtering: no filter UI, filter state/AST, predicates, `filterFns` registrations, server filtering, or filtered-row-model behavior is added in this change.
- Adding `calcFns` or `groupByFns` as pseudo-native TanStack slots.
- Forking or patching `@tanstack/table-core`.
- Adding absent plugin types, new dependencies, or unrelated UI changes.
- Re-exporting common function implementations from the `@notion-kit/table-hook` root entrypoint.
- Removing legacy `compare`, `toValue`, `toGroupValue`, row-sort functions, or formatted counting functions.

### Filtering compatibility boundary

Although filtering is out of scope, this change must not block it:

- reserve TanStack's native `filterFns` and `ColumnDef.filterFn` names for future filtering;
- do not invent a competing plugin-level execution registry;
- calculations must derive their row scope from the pre-grouped/filtered TanStack boundary rather than permanently from `getCoreRowModel()`;
- keep capability metadata extensible so a future plugin can describe valid filter operators and operand editors separately from predicate execution;
- do not add filtering fields to persisted `TableViewState` in this plan.

## 3. Architecture Decisions

### AD1 — Capability descriptors remain the product source of truth

`CellPlugin` answers:

- which operations are valid for this property type;
- stable method IDs and defaults;
- menu labels, descriptions, hints, and grouping of choices;
- property-specific formatters/renderers;
- whether a sorting method may also order groups;
- inline/config-aware/legacy fallbacks when a native registry reference is insufficient.

The descriptor is not a second row-model engine. It references or supplies execution functions consumed by `table-hook`.

### AD2 — TanStack owns standard execution

Use official TanStack seams instead of custom top-level registry slots:

| Concern          | TanStack boundary                                                   | notion-kit extension                                             |
| ---------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Row sorting      | `sortFns`, `ColumnDef.sortFn`, sorted row model                     | selected method ID, labels, config-aware adapter                 |
| Calculation      | `aggregationFns`, `ColumnDef.aggregationFn`, column aggregation API | calculation menu metadata, formatting, legacy counting adapter   |
| Grouping key     | `ColumnDef.getGroupingValue`                                        | registered grouping choices, timezone/week config                |
| Group lifecycle  | grouped row model                                                   | visibility, manual order, automatic group sort, Notion rendering |
| Future filtering | `filterFns`, `ColumnDef.filterFn`, filtered row model               | explicitly deferred                                              |

`sortFns`, `aggregationFns`, and later `filterFns` are the only TanStack-style registries. Unknown fields must not be added to `TableFeatures`, because TanStack treats unknown keys as feature objects rather than row-model function registries.

### AD3 — Shared functions are pure and UI-free

Reusable comparison, aggregation, and grouping-key/date-bucket implementations live in `packages/table-hook/src/fns/`. They are published through the dedicated `@notion-kit/table-hook/fns` package subpath and are not re-exported from `@notion-kit/table-hook`. The subpath is the sole supported public import path for these built-in/common function values and their execution-only types.

The `/fns` entrypoint must remain UI-free and side-effect-free: it must not import the package root, React, table contexts, plugin descriptors, `@notion-kit/ui`, or `@dnd-kit/*`. Its functions operate on neutral values plus explicit option objects such as timezone, week start, or interval size. `table-view` plugin descriptors import these functions from `/fns` and add labels, property extraction, configuration adapters, and result formatting. A plugin may instead provide an inline function when it is plugin-specific, depends on runtime context that cannot be expressed by the common function options, or is registered externally.

`packages/table-hook/tsdown.config.ts` builds `src/index.ts` and `src/fns/index.ts` as independent entries, and `packages/table-hook/package.json` maps `./fns` to `dist/fns.mjs` and `dist/fns.d.mts`. The root entrypoint must stop exporting common function values currently exposed from `src/methods.ts`; descriptor/resolver APIs remain at the root.

Execution resolution is deterministic:

1. selected stable method ID;
2. plugin default method ID;
3. first registered method;
4. native/common function reference or inline implementation;
5. legacy plugin fallback.

### AD4 — Calculation returns data; presentation formats it

New calculation methods should expose an aggregation implementation and a presentation formatter. Numeric/date aggregation remains pure and returns a semantic result where practical; the footer formats it with plugin configuration.

During migration, legacy `CountingMethod.function(context) => string` remains supported through an adapter. It is not the preferred contract for new methods.

The selected calculation must use TanStack's pre-grouped row scope so future filtering naturally affects footer calculations. The current `getCoreRowModel()` counting path is compatibility-only and must not remain the sole execution path.

### AD5 — Grouping remains a native seam plus a Notion extension

Grouping methods supply grouping-key behavior and UI metadata. `table-hook` adapts the selected method to `ColumnDef.getGroupingValue`. It does not create `groupByFns`.

TanStack builds grouped rows and aggregated values. `table-hook` continues to own stable group IDs, visibility, manual drag order, automatic group ordering, and group-label rendering.

### AD6 — State stores references, never executable values

`TableViewState.pluginMethods` stores only selected IDs and group-sort mode. Column configuration and `weekStartsOn` follow their existing ownership. Functions, labels, React nodes, computed group values, and registry objects are never persisted.

## 4. Responsibility Split

### TanStack Table

- standard row-model pipeline;
- native sorting and aggregation registries;
- `sortFn`, `aggregationFn`, and `getGroupingValue` execution boundaries;
- future `filterFns`/`filterFn` boundary, outside this implementation.

### Shared function modules

- pure value comparison and empty ordering;
- numeric/date aggregation implementations;
- grouping-key/bucket helpers;
- execution-only types and explicit option objects required by those functions;
- no menu labels, resource mutation, React, or plugin-ID branching.
- one public barrel at `packages/table-hook/src/fns/index.ts`, exposed only as `@notion-kit/table-hook/fns`.

### `CellPlugin`

- capability availability and stable IDs;
- defaults, labels, groups, hints, and presentation formatters;
- mapping to a native function reference or inline implementation;
- compatibility fallback declarations;
- future filter-operator metadata only when filtering is separately planned.

### `table-hook`

- publish the UI-free common function library through `/fns` without re-exporting it from the root;
- resolve selected/default/fallback methods;
- compose `ColumnDef` execution hooks and available TanStack registries;
- own method-selection/resource state and action payloads;
- supply property config, timezone, and `weekStartsOn` context;
- own Notion group lifecycle and manual/automatic group order;
- choose the correct row scope for calculations;
- never render menu-specific UI.

### `table-view`

- render calculation, sorting, and grouping controls from plugin capabilities;
- render formatted calculation/group values;
- dispatch table APIs with stable IDs;
- contain no built-in property-type execution switches.

## 5. Existing Commit Disposition

Do **not** revert the four existing commits. Preserve their tests and public behavior, then migrate the execution internals incrementally.

| Commit                           | Decision | Hybrid follow-up                                                                                                         |
| -------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `623251a0` method contracts      | Keep     | refine descriptors so native refs/inline fallbacks are execution details; retain resolver and legacy compatibility tests |
| `61a299f2` method state          | Keep     | no architectural rewrite; stable serializable IDs are still required                                                     |
| `d55a1058` grouping execution    | Keep     | retain `getGroupingValue` integration and group lifecycle; explicitly avoid `groupByFns`                                 |
| `e1f60b4d` calculation discovery | Keep     | retain capability-driven menu/footer discovery; migrate calculation execution and row scope behind the same APIs         |

Reverting would discard valid resource compatibility, UI discovery, and grouping lifecycle work, then require recreating it. The safer path is additive migration with regression tests.

## 6. Dependency Graph

```text
Landed baseline: T01 contracts → T02 resource state → T03 grouping → T04 calc discovery
                                      │
                                      ▼
T05 hybrid execution contract and TanStack bridge
  ├── T06 calculation aggregation bridge and row scope
  ├── T07 text/select/checkbox registrations
  ├── T08 number calculations/grouping
  └── T09 date calculations/grouping
          │
          ├── T10 sorting/property menus
          └── T11 grouping menu and automatic group order
                  │
                  ▼
          T12 compatibility workflows
                  │
                  ▼
          T13 full verification
```

T07–T09 are complete. T10 and T11 require these registrations. T12 and T13 are sequential integration checkpoints.

## 7. Implementation Slices

### T01–T04 — Landed baseline audit

Treat the four existing commits as the starting baseline. Update stale task status and add focused regression coverage only when a remaining task changes their contracts. Do not amend or rewrite their history solely to make the commit boundaries match this revised plan.

Acceptance:

- existing stable-ID/resource behavior is preserved;
- calculation menus remain plugin-discovered;
- grouping continues through `getGroupingValue`;
- no `calcFns`/`groupByFns` field is introduced.

### T05 — Define the hybrid execution contract and bridge

Likely files:

- `packages/table-hook/package.json`
- `packages/table-hook/tsdown.config.ts`
- `packages/table-hook/src/index.ts`
- `packages/table-hook/src/fns/index.ts`
- `packages/table-hook/src/fns/types.ts`
- `packages/table-hook/src/fns/sorting.ts`
- `packages/table-hook/src/fns/grouping.ts`
- `packages/table-hook/src/fns/calculating.ts`
- `packages/table-hook/src/methods.ts`
- `packages/table-hook/src/plugins/types.ts`
- `packages/table-hook/src/features/index.ts`
- `packages/table-hook/src/table-contexts/use-table-view.tsx`
- `packages/table-hook/src/__tests__/plugin-methods.test.tsx`

Work:

- create the UI-free `fns` module boundary and move existing reusable common function values out of the root barrel;
- add independent `index` and `fns` build entries plus the explicit `./fns` package export;
- keep descriptor/resolver APIs at the root while making `@notion-kit/table-hook/fns` the only public path for common implementations;
- distinguish capability metadata from execution references;
- support native/common function references plus inline/config-aware functions;
- register only valid TanStack slots (`sortFns`, `aggregationFns`);
- keep legacy fallback execution;
- document deterministic collision/override behavior for built-in and runtime plugin functions;
- ensure custom runtime plugins can use inline functions without rebuilding global defaults.

Acceptance:

- `import { ... } from "@notion-kit/table-hook/fns"` resolves to the built `dist/fns.mjs`/`dist/fns.d.mts` entry;
- the root entrypoint does not re-export common sorting, grouping, or calculation function values;
- the `/fns` source and built artifact do not depend on React, table contexts, plugin descriptor modules, `@notion-kit/ui`, `@dnd-kit/*`, or the root bundle;
- selected methods execute through `ColumnDef.sortFn`, `ColumnDef.aggregationFn`, or `ColumnDef.getGroupingValue` as appropriate;
- `TableFeatures` contains no `calcFns` or `groupByFns`;
- external plugins are not required to mutate static `DEFAULT_FEATURES`;
- native references and inline fallbacks have direct tests.

### T06 — Migrate calculation execution to aggregation semantics

Likely files:

- `packages/table-hook/src/fns/calculating.ts`
- `packages/table-hook/src/methods.ts`
- `packages/table-hook/src/features/counting.ts`
- `packages/table-hook/src/lib/utils.ts`
- `packages/table-hook/src/table-contexts/use-table-view.tsx`
- `packages/table-hook/src/__tests__/counting.test.tsx`

Work:

- place reusable default count and aggregation implementations in `/fns`; keep table/plugin row extraction and footer formatting in adapters outside that entrypoint;
- add the aggregation-based calculation contract and formatter boundary;
- adapt legacy formatted counting methods without removing them;
- assign/resolve the selected aggregation implementation through the column boundary;
- use the table's pre-grouped row scope rather than hard-coding core rows;
- preserve current capped count and empty behavior.

Acceptance:

- existing count results remain unchanged without filters;
- raw/semantic aggregation and footer formatting are independently testable;
- a future filtered row model would affect calculations without changing plugin functions;
- no filtering feature is implemented or tested end-to-end here.

### T07 — Register text-like, checkbox, and select capabilities

Status: Complete.

Implement the reusable text/boolean/select comparison and grouping-key behavior in `table-hook/src/fns/sorting.ts` and `table-hook/src/fns/grouping.ts`, export it from `/fns`, and register the approved choices in the `table-view` descriptors for text/title/link-like, checkbox, select, and multi-select plugins. Plugin-specific property extraction may stay in adapters or inline. Preserve empty-last and first-option semantics.

### T08 — Implement number formatter, aggregations, and interval grouping

Status: Complete.

Implement sum/average/median/min/max/range and interval grouping for 1/10/100/1000 as pure functions in `table-hook/src/fns/`, and export them from `/fns`. Keep number configuration extraction and presentation formatting in `table-view`; it consumes the shared functions through the public subpath. Formatting remains plugin presentation and aggregation remains UI-free.

### T09 — Implement date aggregations and timezone grouping

Status: Complete.

Implement earliest/latest/range plus Relative/Day/Week/Month/Year grouping as pure functions in `table-hook/src/fns/`, and export them from `/fns`. Accept timezone, evaluation time, and `weekStartsOn` through explicit UI-free options. `table-view` adapts `DateConfig.tz`, date property extraction, and presentation formatting; date ranges group by start.

### T10 — Complete sorting and property-menu consumers

Render plugin labels/method choices, persist stable method IDs, and keep direction in TanStack sorting state. Prove a custom runtime plugin works through inline execution without table-view type switches.

### T11 — Complete grouping menu and automatic group ordering

Render grouping-key choices and Manual/automatic group order from plugin capabilities. Reuse value-comparator semantics for automatic group order; keep manual drag and visibility state in `table-hook`.

### T12 — Compatibility and filtering-boundary audit

Verify old resources, legacy plugins, custom runtime plugins, unknown IDs, and existing menu behavior. Audit only the filtering boundary: no competing names/state and calculation row scope is not fixed to core rows. Do not implement filtering behavior.

### T13 — Full verification

Run focused package tests after each task, then package test/typecheck/lint/build and affected repository checks. Record unrelated pre-existing failures without changing unrelated code.

## 8. Test Strategy

Detailed cases live in `tasks/test-plan.md`. The revised priorities are:

1. resolver compatibility and native-ref/inline execution parity;
2. resource round trips and grouping lifecycle regression;
3. aggregation result versus formatting separation;
4. calculation row-scope selection at the pre-grouped boundary;
5. the dedicated `/fns` package export, root non-export, and UI-free artifact boundary;
6. built-in capability matrices and custom runtime plugin discovery;
7. number/date boundary tests;
8. menu integration and full compatibility workflows.

Filtering tests are limited to static/contract assertions required to avoid architectural conflict. No filter behavior suite belongs to this plan.

## 9. Verification Commands

Before package-manager commands:

```sh
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm use 24.11.1 --silent
```

Focused examples:

```sh
$NVM_BIN/pnpm  --filter @notion-kit/table-hook test src/__tests__/plugin-methods.test.tsx
$NVM_BIN/pnpm  --filter @notion-kit/table-hook test src/__tests__/counting.test.tsx
$NVM_BIN/pnpm  --filter @notion-kit/table-view test src/plugins/plugins.test.tsx
```

Completion:

```sh
$NVM_BIN/pnpm  --filter @notion-kit/table-hook test
$NVM_BIN/pnpm  --filter @notion-kit/table-view test
$NVM_BIN/pnpm  --filter @notion-kit/table-hook typecheck
$NVM_BIN/pnpm  --filter @notion-kit/table-view typecheck
$NVM_BIN/pnpm  --filter @notion-kit/table-hook lint
$NVM_BIN/pnpm  --filter @notion-kit/table-view lint
$NVM_BIN/pnpm  --filter @notion-kit/table-hook build
(cd packages/table-hook && node --input-type=module -e "const fns = await import('@notion-kit/table-hook/fns'); if (!fns.aggregateCountAll) process.exit(1)")
$NVM_BIN/pnpm  --filter @notion-kit/table-view build
```

## 10. Risks and Mitigations

| Risk                                                                  | Impact | Mitigation                                                                                             |
| --------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| capability descriptor and native registry become two sources of truth | high   | plugin owns applicability/metadata; native/inline function owns execution; table-hook has one resolver |
| static defaults cannot include runtime plugin functions               | high   | permit inline functions and per-column adapters; do not require mutation of `DEFAULT_FEATURES`         |
| calculation migration changes displayed strings                       | high   | retain legacy adapter, separate raw-result and formatting tests, reuse existing formatters             |
| calculations ignore future filters                                    | high   | move row scope from core rows to TanStack pre-grouped/filtered boundary in T06                         |
| `/fns` accidentally pulls the React/root bundle                       | high   | use an independent build entry; inspect its output when build configuration changes                    |
| common helpers leak back through the root API                         | medium | make root non-export an explicit API test and keep `/fns` as the sole supported public helper path     |
| grouping registry masquerades as native API                           | medium | use only `getGroupingValue`; ban `groupByFns` in the plan                                              |
| controlled resource regressions                                       | high   | retain landed T02 tests and optional stable-ID state                                                   |
| commit rewrite loses validated work                                   | medium | keep all four commits and migrate additively                                                           |

## 11. Approval Gate

Approved on 2026-08-10. This revision supersedes the descriptor-only execution assumptions in the previous plan and makes `@notion-kit/table-hook/fns` the sole public common-function entrypoint. Remaining production implementation may proceed from T05.
