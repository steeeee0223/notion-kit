# Table View Plugin Functions Todo — Hybrid Revision

Status: T01–T04 landed; revised T05–T13 awaiting review

Sources of truth:

- `docs/superpowers/specs/2026-08-07-table-view-plugin-functions.md`
- `packages/table-view/docs/plugins.md`
- `tasks/plan.md`
- `tasks/test-plan.md`

## Working Rules

- Keep commits `623251a0`, `61a299f2`, `d55a1058`, and `e1f60b4d`; do not reset or rewrite them for this architecture revision.
- Use plugin descriptors for applicability and UI metadata, TanStack seams for standard execution, and table-hook for adapters/state/Notion behavior.
- Never add `calcFns` or `groupByFns` to `TableFeatures`.
- Preserve legacy `compare`, `toValue`, `toGroupValue`, inline row-sort, and formatted counting fallbacks.
- Filtering implementation is out of scope: no filter UI, state/AST, predicates, registry entries, or filtered row-model task.
- Do not add dependencies, change CI/workspace configuration, or implement absent plugin types.
- Start each remaining task with failing tests and run its focused verification before checking it off.
- Invoke pnpm through Node 24.11.1 as `$NVM_BIN/pnpm` with the configured global store.

## Dependency Map

```text
[x] T01 Contracts
  └─ [x] T02 State/resource
       └─ [x] T03 Group execution
[x] T04 Calculation discovery
              │
              ▼
[ ] T05 Hybrid bridge
  ├─ [ ] T06 Aggregation execution
  ├─ [ ] T07 Text/select/checkbox registrations
  ├─ [ ] T08 Number methods
  └─ [ ] T09 Date methods
          ├─ [ ] T10 Sort/property menus
          └─ [ ] T11 Group menu/order
                    ▼
              [ ] T12 Compatibility audit
                    ▼
              [ ] T13 Full verification
```

T07, T08, and pure utilities in T09 are parallel-safe after T05. T10/T11 require the relevant built-in registrations. T12/T13 are sequential.

## Landed Baseline

- [x] **T01 — Define plugin method contracts and resolver fallbacks** (`623251a0`)
  - Keep stable IDs, selected → default → first → legacy resolution, value comparison, and compatibility tests.
  - Follow-up contract refinement belongs to T05; do not revert T01.

- [x] **T02 — Persist plugin method state and runtime week start** (`61a299f2`)
  - Keep optional serializable resource state, controlled/uncontrolled ownership, actions, and round-trip tests.

- [x] **T03 — Execute selected grouping methods and group ordering** (`d55a1058`)
  - Keep the `getGroupingValue` seam and Notion-specific group lifecycle.
  - Do not replace it with `groupByFns`.

- [x] **T04 — Discover plugin calculations in table-view** (`e1f60b4d`)
  - Keep capability-driven menu/footer discovery and custom-ID-safe metadata.
  - Calculation execution migration belongs to T06.

## Remaining Tasks

- [ ] **T05 — Define hybrid execution refs and TanStack bridge**
  - Dependencies: T01–T04.
  - Likely files:
    - `packages/table-hook/src/methods.ts`
    - `packages/table-hook/src/plugins/types.ts`
    - `packages/table-hook/src/features/index.ts`
    - `packages/table-hook/src/table-contexts/use-table-view.tsx`
    - `packages/table-hook/src/__tests__/plugin-methods.test.tsx`
  - TDD start:
    - native/common sort and aggregation reference resolution;
    - inline/config-aware runtime plugin execution;
    - legacy fallback and unknown-ID precedence;
    - assertion that no `calcFns`/`groupByFns` slot is exposed.
  - Acceptance:
    - capability metadata is separate from execution references;
    - only valid TanStack `sortFns`/`aggregationFns` slots are registered;
    - selected methods enter TanStack through `sortFn`, `aggregationFn`, or `getGroupingValue`;
    - runtime external plugins do not need to mutate static `DEFAULT_FEATURES`.
  - Verify:
    - `$NVM_BIN/pnpm --filter @notion-kit/table-hook test src/__tests__/plugin-methods.test.tsx`
    - `$NVM_BIN/pnpm --filter @notion-kit/table-hook typecheck`

- [ ] **T06 — Move calculation execution to aggregation semantics**
  - Dependencies: T05.
  - Likely files:
    - `packages/table-hook/src/methods.ts`
    - `packages/table-hook/src/features/counting.ts`
    - `packages/table-hook/src/lib/utils.ts`
    - `packages/table-hook/src/table-contexts/use-table-view.tsx`
    - `packages/table-hook/src/__tests__/counting.test.tsx`
  - TDD start:
    - semantic aggregation result and presentation formatting are separable;
    - legacy formatted count methods produce unchanged output;
    - calculation row scope comes from the pre-grouped TanStack boundary, not directly from core rows.
  - Acceptance:
    - calculation execution can use `aggregationFns`/`aggregationFn` or inline aggregation;
    - existing capped/default/checkbox counts remain compatible;
    - future filtering can affect calculation row scope without rewriting plugin calculations;
    - no filtering implementation is added.
  - Verify:
    - `$NVM_BIN/pnpm --filter @notion-kit/table-hook test src/__tests__/counting.test.tsx src/__tests__/plugin-methods.test.tsx`
    - `$NVM_BIN/pnpm --filter @notion-kit/table-hook typecheck`

- [ ] **T07 — Register text-like, checkbox, and select capabilities**
  - Dependencies: T05.
  - Scope: title/text/email/phone/URL comparisons and Exact/Alphabetical grouping; checkbox sorting/counts; select/multi-select first-option sorting and grouping.
  - Acceptance:
    - exact stable IDs/labels match the matrix;
    - empty-last, case folding, symbol/digit buckets, and first-option behavior are directly tested;
    - shared functions are UI-free and menu discovery has no plugin-ID branch.
  - Verify:
    - `$NVM_BIN/pnpm --filter @notion-kit/table-view test src/plugins/plugins.test.tsx`
    - `$NVM_BIN/pnpm --filter @notion-kit/table-view typecheck`

- [ ] **T08 — Implement number formatter, aggregations, and interval grouping**
  - Dependencies: T05; T06 for final calculation wiring.
  - Scope: shared formatter; sum/average/median/min/max/range; fixed intervals 1/10/100/1000; currency/percent/rounding parity.
  - Acceptance:
    - aggregations are pure and presentation formatting is explicit;
    - invalid/empty/negative/decimal/exact-boundary cases pass;
    - median does not mutate source values.
  - Verify:
    - `$NVM_BIN/pnpm --filter @notion-kit/table-view test src/plugins/number/format.test.ts src/plugins/number/methods.test.ts src/plugins/plugins.test.tsx`

- [ ] **T09 — Implement date aggregations and timezone grouping**
  - Dependencies: T05; T06 for final calculation wiring.
  - Scope: earliest/latest/range; Relative/Day/Week/Month/Year; `DateConfig.tz`; `weekStartsOn`; date ranges group by start.
  - Acceptance:
    - grouping and aggregation helpers are pure and deterministic under frozen time;
    - Taipei and a DST timezone cover midnight/week/month/year boundaries;
    - created/edited time extractors share execution without losing plugin-specific data access.
  - Verify:
    - `$NVM_BIN/pnpm --filter @notion-kit/table-view test src/plugins/date/methods.test.ts src/plugins/date/utils.test.ts src/plugins/plugins.test.tsx`

- [ ] **T10 — Complete sorting and property menus**
  - Dependencies: T07–T09 as applicable.
  - Acceptance:
    - labels and optional method selector come from capabilities;
    - direction remains in TanStack sorting state while method ID remains serializable plugin state;
    - a custom runtime plugin executes through an inline fallback without table-view changes.
  - Verify:
    - `$NVM_BIN/pnpm --filter @notion-kit/table-view test src/menus/sort-menu.test.tsx src/menus/prop-menu.test.tsx`

- [ ] **T11 — Complete grouping menu and automatic group ordering**
  - Dependencies: T03, T07–T09.
  - Acceptance:
    - grouping-key choices and group-sort choices are capability-driven;
    - manual drag, automatic order, visibility, and grouping-method transitions retain landed behavior;
    - checkbox exposes no automatic group sort without a plugin-ID check.
  - Verify:
    - `$NVM_BIN/pnpm --filter @notion-kit/table-view test src/menus/edit-group-menu.test.tsx`
    - `$NVM_BIN/pnpm --filter @notion-kit/table-hook test src/__tests__/grouping.test.tsx`

- [ ] **T12 — Run compatibility workflows and filtering-boundary audit**
  - Dependencies: T06–T11.
  - Acceptance:
    - old resources and all legacy plugin fallbacks work;
    - unknown IDs fall back without unsolicited writes;
    - custom plugin methods need no menu type switch or global default mutation;
    - no `calcFns`, `groupByFns`, filter state, filter UI, or filter predicate implementation was introduced;
    - calculation row scope is not permanently tied to `getCoreRowModel()`.
  - Verify:
    - focused table-hook resource/group/count suites;
    - focused table-view calculation/sort/group menu suites;
    - `rg -n "calcFns|groupByFns" packages/table-hook packages/table-view` has no production API match.

- [ ] **T13 — Full verification**
  - Dependencies: T12.
  - Acceptance:
    - table-hook and table-view tests, typechecks, lint, and builds pass;
    - affected repository checks pass or unrelated pre-existing failures are recorded exactly;
    - docs and task status match implemented behavior.
  - Verify:
    - commands listed in `tasks/plan.md` section 9.

## Checkpoints

- [ ] After T05–T06: hybrid bridge, calculation compatibility, and row-scope tests pass.
- [ ] After T07–T09: all 12 built-ins register the approved matrix.
- [ ] After T10–T11: all menus are capability-driven and custom-plugin integration passes.
- [ ] After T12–T13: compatibility and full package verification pass; filtering remains out of scope.
