# Table View Plugin Functions Todo

Status: Review requested — implementation has not started

Sources of truth:

- `docs/superpowers/specs/2026-08-07-table-view-plugin-functions.md`
- `packages/table-view/docs/plugins.md`
- `tasks/plan.md`
- `tasks/test-plan.md`

## Working Rules

- Execute tasks in dependency order unless a task explicitly lists parallel-safe peers.
- Begin every implementation task with the listed failing tests.
- Keep stable IDs, display labels, and resource values distinct.
- Do not remove legacy `compare`, `toValue`, or `toGroupValue` fallbacks.
- Do not add dependencies, change CI/workspace configuration, or implement absent plugin types.
- Do not run table-hook and table-view coverage concurrently; they share a `coverage/.tmp` path.
- After each task, run its focused command before checking it off.
- Update the spec and obtain approval before changing an approved semantic.

## Dependency Map

```text
T01 Contracts
 ├─ T02 State/resource config
 │   └─ T03 Group execution
 ├─ T04 Calculation discovery
 ├─ T05 Text-like registrations ─┐
 ├─ T06 Checkbox/select          ├─ T10 Sort/prop menus
 ├─ T07 Number formatter         │
 │   └─ T08 Number methods       ├─ T11 Group menu
 └─ T09 Date methods ────────────┘
                                  └─ T12 Compatibility workflows
                                      └─ T13 Full verification
```

T05, T06, T07, and the pure utility portion of T09 are parallel-safe after T01. T10 and T11 begin only after the registrations and T03 are complete.

## Tasks

- [ ] **T01 — Define plugin method contracts and resolver fallbacks**
  - Dependencies: none.
  - Files:
    - `packages/table-hook/src/methods.ts`
    - `packages/table-hook/src/plugins/types.ts`
    - `packages/table-hook/src/features/plugin-methods.ts` (new)
    - `packages/table-hook/src/features/index.ts`
    - `packages/table-hook/src/index.ts`
    - `packages/table-hook/src/__tests__/plugin-methods.test.tsx`
  - TDD start:
    - Add selected → default → first → legacy resolver precedence cases.
    - Add missing-cell normalization and row-only legacy sort eligibility cases.
    - Add value-comparator row ascending/descending cases.
  - Acceptance:
    - `PluginMethodContext`, typed sorting/grouping descriptors, stable method state, and resolver APIs compile publicly.
    - Built-in-capable sorting descriptors expose `toComparable` and `compare` for row/group reuse.
    - Legacy row `function`, plugin `compare`, `toGroupValue`, and `toValue` remain executable.
    - Unknown IDs resolve deterministically without mutating state.
    - Automatic group sorting eligibility is discoverable without plugin-ID checks.
  - Verify:
    - `pnpm --filter @notion-kit/table-hook test src/__tests__/plugin-methods.test.tsx`
    - `pnpm --filter @notion-kit/table-hook typecheck`

- [ ] **T02 — Add method selection resource state and week-start runtime config**
  - Dependencies: T01.
  - Files:
    - `packages/table-hook/src/features/menu.ts`
    - `packages/table-hook/src/table-contexts/types.ts`
    - `packages/table-hook/src/table-contexts/use-table-view.tsx`
    - `packages/table-hook/src/table-contexts/actions.ts`
    - `packages/table-hook/src/__tests__/resource-api.test.tsx`
  - TDD start:
    - Add controlled accept/reject and uncontrolled rerender cases for sorting/grouping method IDs and group-sort mode.
    - Add old/partial view deep-merge cases that retain timeline state.
    - Add `weekStartsOn` default `1` and explicit `0`/`1` method-context cases.
  - Acceptance:
    - `TableViewState.pluginMethods` is optional and serializable.
    - Sorting/grouping method IDs and group-sort mode round-trip through `onViewChange` with exact action payloads.
    - Old resources omit the field and retain current behavior.
    - Resolver fallbacks emit no unsolicited resource writes.
    - `weekStartsOn` accepts `0`–`6`, defaults to `1`, and is not persisted per column.
  - Verify:
    - `pnpm --filter @notion-kit/table-hook test src/__tests__/resource-api.test.tsx src/__tests__/plugin-methods.test.tsx`
    - `pnpm --filter @notion-kit/table-hook typecheck`

- [ ] **T03 — Execute selected grouping methods and manual/automatic group order**
  - Dependencies: T01, T02.
  - Files:
    - `packages/table-hook/src/features/plugin-methods.ts`
    - `packages/table-hook/src/features/grouping.ts`
    - `packages/table-hook/src/features/extended-grouped-row-model.ts`
    - `packages/table-hook/src/__tests__/grouping.test.tsx`
  - TDD start:
    - Add regrouping cases that prune stale visibility and preserve surviving visibility.
    - Add automatic asc/desc order and Manual-after-drag transitions.
    - Add grouping `toSortValue` cases for derived keys.
  - Acceptance:
    - Selected grouping method creates the effective group IDs and values.
    - Each group entry retains a comparable sort value without persisting functions.
    - Automatic order reuses the selected plugin sorting comparator.
    - Manual dragging changes mode exactly once and keeps visibility.
    - Switching back to automatic recomputes deterministic order.
    - Unknown method IDs fall back without crashes or stale IDs.
  - Verify:
    - `pnpm --filter @notion-kit/table-hook test src/__tests__/grouping.test.tsx src/__tests__/plugin-methods.test.tsx`
    - `pnpm --filter @notion-kit/table-hook typecheck`

- [ ] **T04 — Make calculation discovery and footer presentation plugin-driven**
  - Dependencies: T01.
  - Files:
    - `packages/table-hook/src/features/counting.ts`
    - `packages/table-hook/src/lib/utils.ts`
    - `packages/table-view/src/menus/calc-menu.tsx`
    - `packages/table-view/src/table-footer/table-footer-cell.tsx`
    - `packages/table-view/src/menus/constants.ts`
    - `packages/table-hook/src/__tests__/counting.test.tsx`
    - `packages/table-view/src/menus/calc-menu.test.tsx`
  - TDD start:
    - Add a custom calculation group with no built-in type knowledge.
    - Add unknown method and label fallback cases.
    - Preserve generic, checkbox, None, capped-count, and zero-row cases.
  - Acceptance:
    - `calc-menu` renders `plugin.counting` groups and methods directly.
    - Unsupported operations are absent.
    - Footer supports arbitrary string method IDs safely.
    - Rich hints are optional; accessible name and calculation execution work without a hint.
    - Existing specialized checkbox and generic counting results remain unchanged.
  - Verify:
    - `pnpm --filter @notion-kit/table-hook test src/__tests__/counting.test.tsx`
    - `pnpm --filter @notion-kit/table-view test src/menus/calc-menu.test.tsx`
    - `pnpm --filter @notion-kit/table-hook typecheck`
    - `pnpm --filter @notion-kit/table-view typecheck`

- [ ] **T05 — Register text, title, and link sorting/grouping capabilities**
  - Dependencies: T01. Parallel-safe with T06, T07, and T09 utilities.
  - Files:
    - `packages/table-view/src/plugins/sorting.ts` (new)
    - `packages/table-view/src/plugins/text/grouping.ts` (new)
    - `packages/table-view/src/plugins/text/plugin.tsx`
    - `packages/table-view/src/plugins/title/plugin.tsx`
    - `packages/table-view/src/plugins/link/plugin.tsx`
    - `packages/table-view/src/plugins/plugins.test.tsx`
  - TDD start:
    - Add exact registration-set tests for title/text/email/phone/URL.
    - Add A→Z/Z→A comparator cases and Alphabetical grouping case-folding/boundary cases.
  - Acceptance:
    - All five text-like plugins register A→Z/Z→A sorting.
    - Exact groups by complete value.
    - Alphabetical trims, groups case-insensitive first displayed character, returns empty for whitespace, and preserves digit/symbol bucket labels.
    - Descriptor arrays are not shared mutably between plugin instances.
    - Existing public factories and cell behavior remain compatible.
  - Verify:
    - `pnpm --filter @notion-kit/table-view test src/plugins/plugins.test.tsx`
    - `pnpm --filter @notion-kit/table-view typecheck`

- [ ] **T06 — Register checkbox, select, and multi-select capabilities**
  - Dependencies: T01. Parallel-safe with T05, T07, and T09 utilities.
  - Files:
    - `packages/table-view/src/plugins/checkbox/plugin.tsx`
    - `packages/table-view/src/plugins/select/plugin.tsx`
    - `packages/table-view/src/plugins/utils.tsx`
    - `packages/table-view/src/plugins/plugins.test.tsx`
  - TDD start:
    - Add checkbox exact IDs/labels/counting groups and group-sort-disabled cases.
    - Add select/multi-select first-option sorting and empty-last cases.
  - Acceptance:
    - Checkbox exposes Checked→unchecked/Unchecked→checked and specialized calculations.
    - Checkbox explicitly disables automatic group sorting without menu type checks.
    - Select/multi-select use only the first option for sorting and grouping.
    - Select/multi-select retain generic calculation policy.
    - Empty select values remain last ascending.
  - Verify:
    - `pnpm --filter @notion-kit/table-view test src/plugins/plugins.test.tsx`
    - `pnpm --filter @notion-kit/table-view typecheck`

- [ ] **T07 — Extract and lock the shared number formatter**
  - Dependencies: T01. Parallel-safe with T05, T06, and T09 utilities.
  - Files:
    - `packages/table-view/src/plugins/number/format.ts` (new)
    - `packages/table-view/src/plugins/number/format.test.ts` (new)
    - `packages/table-view/src/plugins/number/number-cell.tsx`
    - `packages/table-view/src/plugins/cell-renderers.test.tsx`
  - TDD start:
    - Add exact strings for number, commas, percent, and currency with default/0/2/5 rounding where meaningful.
    - Add zero, negative, large, and fractional values.
  - Acceptance:
    - `formatNumber(value, config)` is pure and shared-ready.
    - Number cell uses it without changing existing rendered strings.
    - Percent/currency units and configured rounding remain visible.
    - No locale-dependent assertion relies on an implicit non-test locale beyond the repository's established behavior.
  - Verify:
    - `pnpm --filter @notion-kit/table-view test src/plugins/number/format.test.ts src/plugins/cell-renderers.test.tsx`
    - `pnpm --filter @notion-kit/table-view typecheck`

- [ ] **T08 — Implement number calculations and fixed-interval grouping**
  - Dependencies: T01, T04, T07.
  - Files:
    - `packages/table-view/src/plugins/number/methods.ts` (new)
    - `packages/table-view/src/plugins/number/methods.test.ts` (new)
    - `packages/table-view/src/plugins/number/plugin.tsx`
    - `packages/table-view/src/plugins/number/number-grouping-value.tsx` (new if rendering cannot remain generic)
    - `packages/table-view/src/plugins/plugins.test.tsx`
  - TDD start:
    - Add Sum/Average/Median/Min/Max/Range matrices including empty, invalid, zero, negative, decimal, duplicates, even/odd median, and source immutability.
    - Add 1/10/100/1000 interval exact/epsilon/negative boundaries.
  - Acceptance:
    - Calculation IDs and grouping IDs exactly match the approved matrix.
    - Invalid/non-finite inputs are ignored; no valid input returns an empty result.
    - Range is max minus min.
    - All results and group endpoints use shared number format/rounding.
    - Intervals use `Math.floor(value / size) * size` and half-open `[start, end)` semantics.
    - Ascending empty-last behavior remains unchanged.
  - Verify:
    - `pnpm --filter @notion-kit/table-view test src/plugins/number/format.test.ts src/plugins/number/methods.test.ts src/plugins/plugins.test.tsx`
    - `pnpm --filter @notion-kit/table-view typecheck`

- [ ] **T09 — Implement timezone-aware date calculations and grouping methods**
  - Dependencies: T01, T02, T04. Pure utilities are parallel-safe after T01.
  - Files:
    - `packages/table-view/src/plugins/date/methods.ts` (new)
    - `packages/table-view/src/plugins/date/methods.test.ts` (new)
    - `packages/table-view/src/plugins/date/utils.ts`
    - `packages/table-view/src/plugins/date/plugin.tsx`
    - `packages/table-view/src/plugins/date/date-grouping-value.tsx`
    - `packages/table-view/src/plugins/date/utils.test.ts`
  - TDD start:
    - Add earliest/latest/date-range cases for Date, Created time, and Last edited time.
    - Add Taipei and New York timezone/DST cases.
    - Add Relative bucket precedence and Sunday/Monday week-start matrices.
  - Acceptance:
    - Date calculation IDs and Relative/Day/Week/Month/Year grouping IDs match the matrix.
    - Date ranges group by start.
    - Date-only duration is zoned calendar-day based; time-aware duration is elapsed and emits at most two non-zero units.
    - Relative buckets are stable, non-overlapping, and chronologically sortable through `toSortValue`.
    - All date boundaries use `DateConfig.tz` and Week uses runtime `weekStartsOn`.
    - Empty ascending behavior remains last.
  - Verify:
    - `pnpm --filter @notion-kit/table-view test src/plugins/date/methods.test.ts src/plugins/date/utils.test.ts src/plugins/plugins.test.tsx`
    - `pnpm --filter @notion-kit/table-view typecheck`

- [ ] **T10 — Make Sort and Property menus capability-driven**
  - Dependencies: T03, T05, T06, T08, T09.
  - Files:
    - `packages/table-view/src/menus/sort-menu.tsx`
    - `packages/table-view/src/menus/prop-menu.tsx`
    - `packages/table-view/src/__tests__/component-objects/sort-menu.ts`
    - `packages/table-view/src/menus/sort-menu.test.tsx`
    - `packages/table-view/src/menus/prop-menu.test.tsx`
  - TDD start:
    - Add text/number/checkbox/date direction-label cases.
    - Add multi-method custom plugin selector and row-order effect.
    - Add property-change default reset and Property-menu parity.
  - Acceptance:
    - Direction labels come from the selected plugin method.
    - One-method built-ins retain compact layout.
    - Multi-method custom plugins expose method selection by stable ID.
    - Changing property resets incompatible method selection safely.
    - Quick-sort actions use the same default method and labels.
    - Existing remove/delete/reorder behavior remains intact.
  - Verify:
    - `pnpm --filter @notion-kit/table-view test src/menus/sort-menu.test.tsx src/menus/prop-menu.test.tsx`
    - `pnpm --filter @notion-kit/table-view typecheck`

- [ ] **T11 — Add grouping-method and group-sort controls**
  - Dependencies: T03, T05, T06, T08, T09, T10 sorting APIs.
  - Files:
    - `packages/table-view/src/menus/edit-group-menu.tsx`
    - `packages/table-view/src/__tests__/component-objects/grouping-menu.ts`
    - `packages/table-view/src/menus/edit-group-menu.test.tsx`
    - `packages/table-view/src/menus/select-group-menu.test.tsx`
  - TDD start:
    - Add Group using visibility/selection cases.
    - Add Manual/automatic asc/desc and drag-to-Manual cases.
    - Add checkbox automatic-sort omission and accessibility states.
  - Acceptance:
    - Group using appears only when meaningful alternatives exist.
    - Number exposes exactly intervals 1/10/100/1000; date exposes exactly Relative/Day/Week/Month/Year.
    - Sort groups exposes Manual plus eligible plugin sort methods.
    - Checkbox exposes no automatic group-sort option.
    - Visibility and selected state survive order changes/rerenders.
    - Controls have stable roles, accessible names, and checked states.
  - Verify:
    - `pnpm --filter @notion-kit/table-view test src/menus/edit-group-menu.test.tsx src/menus/select-group-menu.test.tsx`
    - `pnpm --filter @notion-kit/table-hook test src/__tests__/grouping.test.tsx`
    - `pnpm --filter @notion-kit/table-view typecheck`

- [ ] **T12 — Add compatibility and custom-plugin workflow suites**
  - Dependencies: T04–T11.
  - Files:
    - `packages/table-hook/src/__tests__/plugin-methods.test.tsx`
    - `packages/table-hook/src/__tests__/resource-api.test.tsx`
    - `packages/table-view/src/menus/calc-menu.test.tsx`
    - `packages/table-view/src/menus/sort-menu.test.tsx`
    - `packages/table-view/src/menus/edit-group-menu.test.tsx`
  - TDD start:
    - Add custom-plugin calculate → sort → group workflow.
    - Add old-resource and unknown-ID workflows.
  - Acceptance:
    - A custom plugin is fully discoverable without generic menu changes.
    - Old resources behave as before until a new selection adds minimal optional state.
    - Unknown IDs render/execute through fallback and can be replaced with a valid serialized ID.
    - Workflow tests remain small and do not duplicate pure number/date matrices.
  - Verify:
    - `pnpm --filter @notion-kit/table-hook test src/__tests__/plugin-methods.test.tsx src/__tests__/resource-api.test.tsx`
    - `pnpm --filter @notion-kit/table-view test src/menus/calc-menu.test.tsx src/menus/sort-menu.test.tsx src/menus/edit-group-menu.test.tsx`

- [ ] **T13 — Run coverage, static checks, builds, and matrix audit**
  - Dependencies: T01–T12.
  - Files:
    - `packages/table-view/docs/plugins.md` only if implemented stable IDs/names require an approved documentation correction.
    - No production changes are expected in this task.
  - Acceptance:
    - Every built-in plugin has an exact registration assertion.
    - Every stable ID has a semantic test and selection/resolver path.
    - Pure utility, resolver/state, grouping, and menu changed-file coverage targets from `tasks/test-plan.md` are met.
    - Table-view retains its configured 90% statements/branches thresholds.
    - Table-hook package coverage does not fall below the measured baseline.
    - No plugin capability type switch remains in generic calc/sort/group menus.
    - No unknown-ID-unsafe hint lookup remains.
    - All focused/package/static/build commands pass or any unrelated pre-existing failure is recorded exactly without unrelated edits.
  - Verify sequentially:
    - `rg -n 'type === "(checkbox|number|date|select|text)"' packages/table-view/src/menus`
    - `rg -n 'countMethodHint\[method\]' packages/table-view/src`
    - `pnpm --filter @notion-kit/table-hook test`
    - `pnpm --filter @notion-kit/table-view test`
    - `pnpm --filter @notion-kit/table-hook typecheck`
    - `pnpm --filter @notion-kit/table-view typecheck`
    - `pnpm --filter @notion-kit/table-hook lint`
    - `pnpm --filter @notion-kit/table-view lint`
    - `pnpm --filter @notion-kit/table-hook build`
    - `pnpm --filter @notion-kit/table-view build`
    - `pnpm --filter @notion-kit/table-hook coverage -- --reporter=dot`
    - `pnpm --filter @notion-kit/table-view coverage -- --reporter=dot`
    - `pnpm test`
    - `pnpm typecheck:affected`
    - `pnpm lint:affected`

## Implementation Approval Gate

Production implementation begins only after this todo is reviewed and approved. On approval, execute one task at a time using TDD and update each checkbox only after its focused verification passes.
