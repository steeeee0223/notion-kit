# Implementation Plan: Table Method Review Fixes

## Overview

Replace the temporary automatic/desc group-sort representation with direct manual/ascending/descending state, centralize row-sort invalidation, correct the two confirmed P1 findings, and address only reproducible spec-related PR #167 feedback. Each behavioral change follows a focused red-green-refactor cycle.

Source of truth: `docs/superpowers/specs/2026-08-13-table-method-review-fixes-design.md`.

## Architecture Decisions

- Group sort is persisted directly as `manual | ascending | descending`; non-manual states carry the selected method ID.
- Sorting-method cache invalidation occurs at the authoritative table-hook state boundary, not inside a menu component.
- Only reproducible, spec-related PR feedback is implemented; low-value cleanup remains out of scope.

- The extended grouped row model calls the active column definition's `getGroupingValue` instead of consuming TanStack's stale per-row grouping cache.
- Group IDs continue through `createGroupId`; no private TanStack cache is read or cleared.
- Empty date labels go through `DefaultGroupingValue`; invalid values never reach date formatting.
- Date/timezone operations in `table-hook/src/fns` use direct `date-fns` and `@date-fns/tz` dependencies.
- Group-sort radio state is `manual | ascending | descending`; the resolved sorting method remains table state, not radio state.
- Existing user changes in `packages/table-view/src/menus/edit-group-menu.tsx` are preserved and edited in place.

## High-Value Test Strategy

| Test                                                                                 | Production regression caught                                               | Why it earns its place                                                                                                        |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `TestGroupedRowModel_GroupingMethodChanges_RecomputesRowsWithCurrentMethod`          | `groupOrder` changes while grouped rows retain cached values               | Directly isolates the root cause using real table rows and two materially different grouping functions                        |
| `TestEditGroupMenu_TextMethodChanges_ReplacesExactTableGroupsWithAlphabeticalGroups` | Menu shows `1/D/Q/W` while the table shows exact or empty groups           | Covers the reported user path across menu, plugin, table-hook, and rendered groups                                            |
| `TestEditGroupMenu_NumberMethodChanges_ReplacesUnitTableGroupsWithIntervalGroups`    | `Every 10` menu groups coexist with stale `Every 1` table groups           | Covers exact interval boundaries and rejects leftover bucket IDs                                                              |
| `TestEditGroupMenu_DateMethodsWithEmptyCell_KeepSingleEmptyGroupWithoutThrowing`     | Empty dates crash initially or after changing Relative/Day/Week/Month/Year | Guards both reported date failures in one table-driven interaction test                                                       |
| `TestGroupSortControl_ResolvedMethod_OffersOnlyModeAndDirections`                    | Multiple method-prefixed radio options return                              | Documents the non-obvious three-state control contract through visible behavior                                               |
| `TestGroupSortControl_ColonMethodDirectionChange_PreservesMethodAndUpdatesDirection` | Direction parsing truncates or replaces a method ID containing `:`         | Adversarial regression for the removed `${method.id}:...` encoding                                                            |
| Existing timezone/DST/date-boundary tests                                            | date-fns migration changes public grouping semantics                       | Existing tests already cover Taipei midnight, week starts, New York DST, month/year boundaries, invalid inputs, and sort keys |

Tests deliberately not added:

- assertions on `_groupingValuesCache`, because it is a private implementation detail;
- source-text assertions proving a date-fns import, because they do not test behavior;
- one null renderer test per date method, because the full menu transition test exercises the real interaction once per method;
- duplicate happy-path tests for existing date aggregation metadata behavior.

## Dependency Graph

```text
T01 grouped-row cache regression
  └─ T02 real text/number/date grouping transitions

T03 date-fns migration ─┐
                       ├─ T05 complete verification
T04 group-sort states ─┘
```

T01 precedes T02 so the root defect is fixed before the broader UI assertions. T03 and T04 are logically independent but will run sequentially because both verification paths touch the same table packages and active menu test file.

## Task List

### Phase 1: Group recomputation

## Task 1: Recompute grouped rows with the current method

**Description:** Add a table-hook regression test that changes a real grouping method after the grouped row model has already cached its first result. Then make the row model derive grouping values from the active column definition.

**Acceptance criteria:**

- [ ] `TestGroupedRowModel_GroupingMethodChanges_RecomputesRowsWithCurrentMethod` fails before the production change for the expected stale-row reason.
- [ ] After the change, actual grouped-row values and IDs equal the new method's expected literals.
- [ ] No code reads, clears, or mutates TanStack's `_groupingValuesCache`.

**Verification:**

- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook exec vitest run src/__tests__/grouping.test.tsx`
- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook typecheck`

**Dependencies:** None.

**Files likely touched:**

- `packages/table-hook/src/__tests__/grouping.test.tsx`
- `packages/table-hook/src/features/extended-grouped-row-model.ts`

**Estimated scope:** Small.

## Task 2: Verify real text, number, and date transitions

**Description:** Exercise the actual table-view menu with built-in plugins. Prove that text and number methods replace rendered table groups, and that every date method preserves one safe empty group.

**Acceptance criteria:**

- [ ] Text exact → alphabetical yields only the literal expected alphabetical groups in the rendered table and removes exact groups.
- [ ] Number Every 1 → Every 10 yields only the literal expected interval groups, including exact-boundary values, and removes unit buckets.
- [ ] Relative/Day/Week/Month/Year transitions with an empty date cell retain one `(Empty)` group and never throw.

**Verification:**

- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view exec vitest run src/menus/edit-group-menu.test.tsx`
- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view typecheck`

**Dependencies:** Task 1.

**Files likely touched:**

- `packages/table-view/src/menus/edit-group-menu.test.tsx`
- `packages/table-view/src/plugins/date/date-grouping-value.tsx`
- test fixtures only if existing fixtures cannot express the boundary values

**Estimated scope:** Medium.

### Checkpoint: Group transitions

- [ ] Task 1 and Task 2 focused tests pass together.
- [ ] Grouping state IDs equal rendered grouped-row IDs after each method transition.
- [ ] No prior grouping-menu behavior regresses.

### Phase 2: Date operations and group-sort state

## Task 3: Migrate table-hook date operations to date-fns

**Description:** Add direct date-fns dependencies, replace custom timezone keys/calendar arithmetic/parsing and date aggregation comparisons with date-fns APIs, and preserve the existing public outputs.

**Acceptance criteria:**

- [ ] `date-fns` and `@date-fns/tz` are direct `@notion-kit/table-hook` dependencies using workspace-approved versions.
- [ ] `packages/table-hook/src/fns` contains no hand-written date boundary, weekday-offset, ISO-slicing, or day/week millisecond arithmetic.
- [ ] Existing timezone, DST, week-start, invalid-input, relative grouping, sort-key, and aggregation behavior tests remain green.

**Verification:**

- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook exec vitest run src/fns/__tests__/grouping.test.ts src/fns/__tests__/calculating.test.ts`
- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook typecheck`
- [ ] Review the production diff for prohibited custom date operations; do not replace this review with a source-text unit test.

**Dependencies:** None.

**Files likely touched:**

- `packages/table-hook/package.json`
- `pnpm-lock.yaml`
- `packages/table-hook/src/fns/grouping.ts`
- `packages/table-hook/src/fns/calculating.ts`
- `packages/table-hook/src/fns/__tests__/grouping.test.ts`

**Estimated scope:** Medium.

## Task 4: Reduce group-sort radio state to three values

**Description:** Rewrite the group-sort control around manual/ascending/descending, resolve one active eligible method for labels and execution, and replace the existing method-prefixed tests with behavior-level state tests.

**Acceptance criteria:**

- [ ] The menu exposes Manual plus exactly one resolved method's ascending and descending labels.
- [ ] Selecting ascending or descending writes the resolved method ID and the correct `desc` boolean without parsing a method prefix.
- [ ] A stored method ID containing `:` remains intact when direction changes; manual-only and invalid-method fallback behavior remains green.

**Verification:**

- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view exec vitest run src/menus/edit-group-menu.test.tsx`
- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view typecheck`

**Dependencies:** None.

**Files likely touched:**

- `packages/table-view/src/menus/edit-group-menu.test.tsx`
- `packages/table-view/src/menus/edit-group-menu.tsx`

**Estimated scope:** Small.

### Checkpoint: Date and sorting contracts

- [ ] Date function and calculation suites pass.
- [ ] Group-sort tests expose only the three intended states.
- [ ] Existing user styling edits in `edit-group-menu.tsx` remain present.

### Phase 3: Complete verification

## Task 5: Run affected-package verification

**Description:** Run formatting, focused and full package suites, typechecks, lint, and builds after all TDD slices are green.

**Acceptance criteria:**

- [ ] All new tests were observed failing for their intended production regression before implementation.
- [ ] All table-hook and table-view tests pass with no new warnings or unhandled errors.
- [ ] Typecheck, lint, formatting, and package builds pass; unrelated pre-existing failures are recorded exactly.

**Verification:**

- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test`
- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view test`
- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook typecheck`
- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view typecheck`
- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook lint`
- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view lint`
- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook build`
- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view build`
- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store exec prettier --check packages/table-hook/package.json packages/table-hook/src/fns packages/table-hook/src/features/extended-grouped-row-model.ts packages/table-hook/src/__tests__/grouping.test.tsx packages/table-view/src/menus/edit-group-menu.tsx packages/table-view/src/menus/edit-group-menu.test.tsx packages/table-view/src/plugins/date/date-grouping-value.tsx tasks/plan.md tasks/todo.md`

**Dependencies:** Tasks 1–4.

**Files likely touched:** None beyond formatting corrections in scoped files.

**Estimated scope:** Small.

### Checkpoint: Complete

- [ ] Every spec goal has a consumer-visible assertion or an explicit review check.
- [ ] All affected verification is green.
- [ ] Work is ready for code review.

## Risks and Mitigations

| Risk                                                                   | Impact | Mitigation                                                                        |
| ---------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| Calling `ColumnDef.getGroupingValue` with the wrong TanStack signature | High   | Use a real row-model regression test and mirror TanStack's documented arguments   |
| TZDate/date-fns changes week or DST semantics                          | High   | Keep literal Taipei, Sunday/Monday, New York DST, month/year boundary assertions  |
| UI integration test only inspects menu groups                          | High   | Assert rendered table group row labels/IDs separately from menu items             |
| Multiple sorting methods make the active method ambiguous              | Medium | Seed a stored active method and assert only its two direction labels are rendered |
| User's existing menu styling changes are overwritten                   | Medium | Treat the dirty file as user-owned and patch only the group-sort logic            |

## Open Questions

None. The approved design resolves group transition, date-fns, empty-date, and group-sort semantics.
