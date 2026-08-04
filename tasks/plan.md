# Implementation Plan: TanStack Table Row Selection

## Overview

Integrate internally owned TanStack row-selection state into table-hook and connect it to table-view leaf, group, and header checkboxes. The implementation establishes selection semantics and action visibility for a future bulk-edit feature while leaving bulk editing and public controlled-state props out of scope.

The approved design is documented in `docs/superpowers/specs/2026-08-04-tanstack-table-row-selection-design.md`.

## Architecture Decisions

- Register TanStack's `rowSelectionFeature` in the existing `DEFAULT_FEATURES` composition.
- Keep `rowSelection` owned by the table instance; do not add controlled/default selection props or a change callback.
- Store only stable leaf data-row IDs. Group checkboxes derive and mutate recursive leaf selections without retaining synthetic group IDs.
- Derive `hasSelection` from the internal selection slice and pass it explicitly to presentational components.
- Keep mobile controls visible; on desktop, reveal every `TableRowActionGroup` whenever any row is selected.
- Prune deleted IDs, preserve selection across layout changes, and clear selection when the table becomes locked.
- Exercise behavior through hook contracts and real component interactions, using `TestUnit_Scenario_ExpectedOutcome` names.

## Dependency Graph

```text
TanStack rowSelectionFeature registration
    |
    +-- Internal selection lifecycle and stale-ID cleanup
    |       |
    |       +-- Leaf checkbox state and handlers
    |       +-- Header tri-state and select-all handler
    |       +-- Group descendant tri-state and toggle behavior
    |
    +-- hasSelection derivation
            |
            +-- TableRowActionGroup visibility
            +-- Header/group checkbox visibility
            +-- Memoized body reactivity

All behavior slices
    |
    +-- Focused interaction tests
    +-- Typecheck, lint, format, and package test verification
```

## Test Suite Design

The test suite follows the `testing-strategy` skill:

- Prefer tests that catch a user-visible regression, document a non-obvious state contract, or prove interaction between real components.
- Use Arrange–Act–Assert with one behavior per test.
- Use the naming format `TestUnit_Scenario_ExpectedOutcome`.
- Avoid direct tests of trivial TanStack getters and broad snapshots of unrelated styling.
- Cover adversarial paths: empty data, stale IDs, reused IDs, collapsed/nested groups, locked transitions, layout round trips, and memoized resize rendering.

### Hook Contract Suite

Create `packages/table-hook/src/__tests__/row-selection.test.tsx` for state ownership and lifecycle:

- `UseTableView_RowSelectionWithoutPublicProps_OwnsInternalSelectionState`
- `UseTableView_SelectedRowRemoved_PrunesStaleSelectionId`
- `UseTableView_ReusedDeletedRowId_DoesNotRestoreSelection`
- `UseTableView_ViewBecomesLocked_ClearsSelectionState`
- `UseTableView_LayoutChanges_PreservesSelectionState`
- `UseTableView_GroupToggle_SelectsOnlyDescendantLeafIds`

### Component Interaction Suite

Create `packages/table-view/src/table-body/table-row-selection.test.tsx` and extend component objects only where reusable selection operations materially improve readability:

- Leaf toggle and Shift-range behavior.
- Header unchecked, indeterminate, checked, select-all, and clear-all behavior.
- Global action-group visibility after the first selected row.
- Group tri-state behavior over collapsed and nested descendants.
- Deletion, locked, layout, mobile, and column-resize regressions.
- Unique accessible checkbox names.

## Task Details

## Task 1: Establish the internal row-selection state contract

**Description:** Register TanStack's row-selection feature and prove that a mounted table instance owns its selection state without expanding the public `TableView` prop surface.

**Acceptance criteria:**

- [ ] `rowSelectionFeature` is included in `TableFeatures` and `DEFAULT_FEATURES`.
- [ ] A new table instance starts with an empty selection and updates through TanStack instance APIs.
- [ ] `TableProps` and `BaseTableProps` expose no row-selection state, default, or callback props.

**Verification:**

- [ ] Focused tests pass: `CI=true $NVM_BIN/pnpm -F @notion-kit/table-hook test -- --run src/__tests__/row-selection.test.tsx`
- [ ] Typecheck passes: `$NVM_BIN/pnpm -F @notion-kit/table-hook typecheck`

**Dependencies:** None

**Files likely touched:**

- `packages/table-hook/src/features/index.ts`
- `packages/table-hook/src/table-contexts/use-table-view.tsx`
- `packages/table-hook/src/__tests__/row-selection.test.tsx`

**Estimated scope:** Medium: 3 files

## Task 2: Enforce selection lifecycle rules

**Description:** Keep internal selection consistent with data and view lifecycle by pruning missing data-row IDs, clearing selection on lock, and preserving valid selection across layout changes.

**Acceptance criteria:**

- [ ] Removing a selected row through internal or controlled data updates removes its ID from selection.
- [ ] Reusing a deleted ID does not restore its prior selection.
- [ ] Locking the table clears selection; changing layout does not.

**Verification:**

- [ ] Lifecycle tests pass in `packages/table-hook/src/__tests__/row-selection.test.tsx`.
- [ ] Existing resource API tests pass without new selection props or callbacks.

**Dependencies:** Task 1

**Files likely touched:**

- `packages/table-hook/src/table-contexts/use-table-view.tsx`
- `packages/table-hook/src/__tests__/row-selection.test.tsx`
- `packages/table-hook/src/__tests__/resource-api.test.tsx`

**Estimated scope:** Medium: 3 files

## Checkpoint: Internal State Foundation

- [ ] Tasks 1–2 acceptance criteria are satisfied.
- [ ] `@notion-kit/table-hook` focused tests and typecheck pass.
- [ ] No public row-selection ownership API has been introduced.

## Task 3: Connect leaf and header selection interactions

**Description:** Replace disconnected checkboxes with controlled leaf and header selection controls, including Shift-range behavior, tri-state header rendering, select-all/clear-all, and unique accessible names.

**Acceptance criteria:**

- [ ] Leaf checkboxes reflect and toggle their row's selected state through TanStack handlers.
- [ ] The header renders unchecked, indeterminate, or checked from the current leaf selection and toggles all rows.
- [ ] Empty data renders an unchecked header and all selection controls have unique accessible names.

**Verification:**

- [ ] Focused interaction tests pass: `CI=true $NVM_BIN/pnpm -F @notion-kit/table-view test -- --run src/table-body/table-row-selection.test.tsx`
- [ ] Manual check: click a row checkbox, Shift-click another row, then use the header to clear selection.

**Dependencies:** Tasks 1–2

**Files likely touched:**

- `packages/table-view/src/table-body/table-row.tsx`
- `packages/table-view/src/table-header/table-header-row.tsx`
- `packages/table-view/src/__tests__/component-objects/table-view.ts`
- `packages/table-view/src/table-body/table-row-selection.test.tsx`

**Estimated scope:** Medium: 4 files

## Task 4: Implement recursive grouped-row selection

**Description:** Add a group checkbox whose state summarizes all descendant leaf rows and whose toggle updates those leaves even when descendants are collapsed or nested.

**Acceptance criteria:**

- [ ] Group checkboxes render unchecked, indeterminate, and checked from all recursive descendant leaves.
- [ ] Toggling a group selects or clears descendant leaf IDs without retaining a synthetic group ID.
- [ ] Collapsed and nested groups behave identically to expanded groups.

**Verification:**

- [ ] Group interaction tests pass in `packages/table-view/src/table-body/table-row-selection.test.tsx`.
- [ ] Hook identity test proves selected IDs contain only data-row IDs.
- [ ] Manual check: partially select a group, collapse it, toggle the group checkbox twice, and verify header state.

**Dependencies:** Task 3

**Files likely touched:**

- `packages/table-view/src/table-body/table-grouped-row.tsx`
- `packages/table-view/src/table-body/table-body.tsx`
- `packages/table-view/src/table-body/table-row-selection.test.tsx`
- `packages/table-hook/src/__tests__/row-selection.test.tsx`

**Estimated scope:** Medium: 4 files

## Checkpoint: Selection Behavior

- [ ] Tasks 3–4 acceptance criteria are satisfied.
- [ ] Leaf, header, collapsed-group, and nested-group flows work end to end.
- [ ] Header and group indeterminate semantics use `some && !all`.

## Task 5: Apply selection-driven visibility and protect reactivity

**Description:** Make selection visibility explicit across row actions, header controls, and group controls while preserving desktop hover behavior, mobile visibility, and updates during memoized column resizing.

**Acceptance criteria:**

- [ ] With no selection, desktop action groups remain transparent except for existing hover, drag, and open states.
- [ ] Once any row is selected, every `TableRowActionGroup` and every selection control renders at full opacity.
- [ ] Mobile controls stay visible and selection UI continues updating during active column resizing.

**Verification:**

- [ ] Visibility, mobile, and memoized-resize tests pass in the focused table-view suite.
- [ ] Manual check: select one row and verify checkbox, add, drag, group, and header surfaces remain visible.

**Dependencies:** Tasks 3–4

**Files likely touched:**

- `packages/table-view/src/common/table-row-action-group.tsx`
- `packages/table-view/src/table-body/table-body.tsx`
- `packages/table-view/src/table-body/table-row.tsx`
- `packages/table-view/src/table-body/table-grouped-row.tsx`
- `packages/table-view/src/table-header/table-header-row.tsx`

**Estimated scope:** Medium: 5 files

## Task 6: Complete regression coverage and affected-workspace verification

**Description:** Consolidate test helpers, run the full affected package checks, and verify that the implementation meets the approved design without adding bulk-edit behavior.

**Acceptance criteria:**

- [ ] Test names follow `TestUnit_Scenario_ExpectedOutcome` and each test has a single meaningful behavior.
- [ ] No redundant happy-path or broad snapshot tests are added.
- [ ] All approved acceptance criteria pass with no bulk-edit UI or public selection props.

**Verification:**

- [ ] `CI=true $NVM_BIN/pnpm -F @notion-kit/table-hook test -- --run`
- [ ] `CI=true $NVM_BIN/pnpm -F @notion-kit/table-view test -- --run`
- [ ] `$NVM_BIN/pnpm -F @notion-kit/table-hook typecheck`
- [ ] `$NVM_BIN/pnpm -F @notion-kit/table-view typecheck`
- [ ] `$NVM_BIN/pnpm -F @notion-kit/table-hook lint`
- [ ] `$NVM_BIN/pnpm -F @notion-kit/table-view lint`
- [ ] `$NVM_BIN/pnpm -F @notion-kit/table-hook format`
- [ ] `$NVM_BIN/pnpm -F @notion-kit/table-view format`

**Dependencies:** Tasks 1–5

**Files likely touched:**

- `packages/table-hook/src/__tests__/row-selection.test.tsx`
- `packages/table-view/src/table-body/table-row-selection.test.tsx`
- `packages/table-view/src/__tests__/component-objects/table-view.ts`

**Estimated scope:** Medium: 3 files

## Checkpoint: Complete

- [ ] All task acceptance criteria are met.
- [ ] Focused and full package tests pass.
- [ ] Typecheck, lint, and format checks pass in both affected packages.
- [ ] Manual desktop, mobile, grouping, locking, and layout checks pass.
- [ ] Implementation is ready for code review.

## Risks and Mitigations

| Risk                                                                            | Impact                                                     | Mitigation                                                                                        |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| TanStack v9 treats `getIsSomeRowsSelected()` as true when all rows are selected | Header or group remains indeterminate after full selection | Always calculate indeterminate as `some && !all`; cover all three states in interaction tests     |
| Group handlers store synthetic group IDs                                        | Regrouping or cleanup produces stale selection             | Derive recursive leaf IDs and update only those IDs; assert selected IDs in hook tests            |
| Data cleanup loops or emits unnecessary state updates                           | Excess renders and unstable tests                          | Compare the pruned and previous maps and return the previous object when unchanged                |
| Memoized body ignores selection                                                 | Checkbox and opacity UI becomes stale during resize        | Include the selection slice or revision in the memoized render contract and add a regression test |
| Duplicate checkbox IDs target the wrong row                                     | Incorrect click and accessibility behavior                 | Use unique accessible names and unique IDs only when label association requires them              |
| CSS assertions become brittle                                                   | Unrelated styling changes break the suite                  | Assert only the explicit opacity/visibility contract, not full class snapshots                    |

## Resolved Decisions

- All `TableRowActionGroup` instances, including add and drag controls, become visible while selection exists.
- Group rows participate through header-equivalent tri-state checkboxes scoped to recursive leaf descendants.
- Deleted rows are pruned, layout changes preserve selection, locked views clear it, and mobile controls remain visible.
- Bulk edit remains outside this implementation.

## Plan Verification Checklist

- [x] Every implementation task has explicit acceptance criteria.
- [x] Every implementation task has focused verification steps.
- [x] Dependencies are identified and ordered.
- [x] No task is larger than five likely touched files.
- [x] Checkpoints separate state, behavior, and completion phases.
- [x] No unresolved product question remains.
- [ ] Human review and approval are required before implementation begins.
