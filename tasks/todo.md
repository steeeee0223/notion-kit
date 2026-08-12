# Table Method Review Fixes Todo

Source: `docs/superpowers/specs/2026-08-13-table-method-review-fixes-design.md`

## Working Rules

- Use TDD for every behavioral fix: add one focused test, observe the expected failure, make the smallest production change, and rerun it.
- Name new tests `TestUnit_Scenario_ExpectedOutcome`.
- Assert real grouped rows, rendered groups, and persisted public state—not mocks or TanStack private caches.
- Derive expected group values and IDs as hand-checked literals.
- Preserve the existing uncommitted `MenuItemAction` styling changes in `edit-group-menu.tsx`.
- Use nvm Node `24.11.1`, `$NVM_BIN/pnpm`, and `/Users/awen/Documents/Codex/.pnpm-store`.

## Current review-fix tasks

- [x] **R01 — Direct three-state group sorting**
  - [x] Replace `automatic + desc` with `manual | ascending | descending`.
  - [x] Preserve controlled state, group ordering, and drag settlement.
  - [x] Emit complete group-sort action deltas.
- [x] **R02 — Central row-sort invalidation and checkbox execution**
  - [x] Add a failing API-level invalidation regression test.
  - [x] Invalidate only after authoritative method changes.
  - [x] Remove the sort-menu cache-busting call.
  - [x] Verify checkbox labels against actual row order.
- [x] **R03 — Material PR #167 edge cases**
  - [x] Reject negative date sentinels and preserve configured timezone labels.
  - [x] Normalize sparse comparator input and runtime context.
  - [x] Trim unique-count values and scope the count-cap switch.
  - [x] Review select method duplication; keep explicit descriptors because extraction would add indirection without changing behavior.
- [x] **R04 — Test-value audit and verification**
  - [x] Remove temporary, duplicate, and implementation-only tests.
  - [x] Run package tests, typechecks, lint, format, and builds.
  - [x] Reply to every unresolved PR thread with Fixed or Not changing.

## Dependency Map

```text
[x] T01 current row grouping values
  └─ [x] T02 built-in text/number/date transitions

[x] T03 date-fns migration ─┐
                            ├─ [x] T05 full verification
[x] T04 group-sort states ──┘
```

## Tasks

- [x] **T01 — Recompute grouped rows with the active grouping method**
  - [x] Add `TestGroupedRowModel_GroupingMethodChanges_RecomputesRowsWithCurrentMethod`.
  - [x] Observe stale grouped-row values/IDs while synchronized menu state already contains new groups.
  - [x] Bypass the stale row cache through the active column definition.
  - [x] Run focused table-hook grouping tests and typecheck.

- [x] **T02 — Verify real built-in grouping transitions**
  - [x] Add `TestEditGroupMenu_TextMethodChanges_ReplacesExactTableGroupsWithAlphabeticalGroups`.
  - [x] Add `TestEditGroupMenu_NumberMethodChanges_ReplacesUnitTableGroupsWithIntervalGroups`, including exact interval boundaries.
  - [x] Add `TestEditGroupMenu_DateMethodsWithEmptyCell_KeepSingleEmptyGroupWithoutThrowing` as a table-driven method transition.
  - [x] Render null date grouping values through `(Empty)`.
  - [x] Run focused table-view grouping-menu tests and typecheck.

### Checkpoint: Group transitions

- [x] Menu groups, grouping state, and rendered table groups agree after every method change.
- [x] Old text and number buckets are absent.
- [x] Empty date groups do not throw.

- [x] **T03 — Replace custom date operations with date-fns**
  - [x] Add direct `date-fns` and `@date-fns/tz` table-hook dependencies.
  - [x] Refactor grouping timezone/boundary/difference/parsing logic with TZDate and date-fns.
  - [x] Refactor date aggregation validity/comparison/boundary operations with date-fns.
  - [x] Replace the implementation-specific `Intl.DateTimeFormat` mock test with invalid-date behavior if necessary.
  - [x] Run focused date grouping/calculation tests and typecheck.
  - [x] Review the diff for prohibited hand-written calendar arithmetic.

- [x] **T04 — Simplify group-sort radio state**
  - [x] Replace method-prefixed values with `manual`, `ascending`, and `descending`.
  - [x] Add `TestGroupSortControl_ResolvedMethod_OffersOnlyModeAndDirections`.
  - [x] Adapt the colon-ID regression into `TestGroupSortControl_ColonMethodDirectionChange_PreservesMethodAndUpdatesDirection`.
  - [x] Keep manual-only and invalid-method fallback tests green.
  - [x] Run focused menu tests and typecheck.

### Checkpoint: Date and group sort

- [x] Date grouping semantics are unchanged across timezone, week-start, DST, month, and year boundaries.
- [x] Group sort has exactly three state values and preserves the resolved method ID.
- [x] Existing user styling changes remain intact.

- [x] **T05 — Complete verification**
  - [x] Run full table-hook and table-view test suites.
  - [x] Run package typechecks, lint, and builds.
  - [x] Run scoped Prettier check.
  - [x] Confirm every new behavioral test was observed failing for the intended reason before implementation.
  - [x] Record any unrelated pre-existing failure exactly: table-view lint reports the existing `src/row-view/full-view.tsx:39` `h1` warning and exits successfully.

### Complete

- [x] All approved spec goals are verified.
- [x] No stale groups or invalid-date render failures remain.
- [x] Work is ready for review.
