# Todo: TanStack Table Row Selection

Implementation must not begin until the spec and plan are approved.

## Phase 1: Internal State Foundation

- [ ] Task 1 — Register `rowSelectionFeature` in `TableFeatures` and `DEFAULT_FEATURES`.
  - [ ] Add the focused table-hook row-selection test suite.
  - [ ] Prove each mounted table owns an initially empty selection map.
  - [ ] Confirm no public controlled/default selection props or callback are added.
- [ ] Task 2 — Implement selection lifecycle cleanup.
  - [ ] Prune IDs missing from controlled or uncontrolled data.
  - [ ] Prove a reused deleted ID does not restore selection.
  - [ ] Clear selection when the view becomes locked.
  - [ ] Preserve selection across layout changes.
- [ ] Checkpoint — Run focused `@notion-kit/table-hook` tests and typecheck.

## Phase 2: Leaf and Header Selection

- [ ] Task 3 — Connect leaf-row checkboxes.
  - [ ] Bind checked state to `row.getIsSelected()`.
  - [ ] Use the TanStack handler for ordinary and Shift-range selection.
  - [ ] Give every row checkbox a unique accessible name.
- [ ] Task 3 — Connect the table-header checkbox.
  - [ ] Render unchecked when no rows are selected or data is empty.
  - [ ] Render indeterminate when some but not all rows are selected.
  - [ ] Render checked when all selectable rows are selected.
  - [ ] Toggle all rows and clear all rows.
  - [ ] Give the header checkbox a distinct accessible name.
- [ ] Checkpoint — Run focused leaf/header interaction tests and perform the Shift-range manual check.

## Phase 3: Group Selection

- [ ] Task 4 — Add grouped-row tri-state checkboxes.
  - [ ] Aggregate all recursive descendant leaf rows.
  - [ ] Select every descendant leaf from unchecked or indeterminate.
  - [ ] Clear every descendant leaf from checked.
  - [ ] Avoid retaining synthetic group IDs.
  - [ ] Keep collapsed and nested groups behaviorally equivalent to expanded groups.
- [ ] Checkpoint — Verify group state against leaf and header state in expanded, collapsed, and nested cases.

## Phase 4: Visibility and Reactivity

- [ ] Task 5 — Add explicit selection-driven visibility to `TableRowActionGroup`.
  - [ ] Keep desktop default at `opacity-0`.
  - [ ] Preserve row-hover, dragging, and open-popover reveal conditions.
  - [ ] Show every checkbox, add action, and drag action at `opacity-100` after any selection.
- [ ] Task 5 — Apply header and group checkbox visibility.
  - [ ] Keep desktop controls transparent until hover or selection.
  - [ ] Keep mobile controls at `opacity-100`.
- [ ] Task 5 — Protect memoized body reactivity.
  - [ ] Ensure selection changes render during active column resizing.
  - [ ] Add the regression test before changing the memo contract.
- [ ] Checkpoint — Verify desktop, mobile, and resize visibility behavior.

## Phase 5: Regression Suite

- [ ] Task 6 — Finish tests using `TestUnit_Scenario_ExpectedOutcome` names.
  - [ ] `UseTableView_RowSelectionWithoutPublicProps_OwnsInternalSelectionState`
  - [ ] `UseTableView_SelectedRowRemoved_PrunesStaleSelectionId`
  - [ ] `UseTableView_ReusedDeletedRowId_DoesNotRestoreSelection`
  - [ ] `UseTableView_ViewBecomesLocked_ClearsSelectionState`
  - [ ] `UseTableView_LayoutChanges_PreservesSelectionState`
  - [ ] `UseTableView_GroupToggle_SelectsOnlyDescendantLeafIds`
  - [ ] `TableRowSelection_RowCheckboxClick_TogglesSelectedState`
  - [ ] `TableRowSelection_ShiftClick_SelectsInclusiveDisplayedRange`
  - [ ] `TableRowSelection_OneSelectedRow_RevealsEveryRowActionGroup`
  - [ ] `TableHeaderSelection_NoRowsSelected_RendersUnchecked`
  - [ ] `TableHeaderSelection_SomeRowsSelected_RendersIndeterminate`
  - [ ] `TableHeaderSelection_AllRowsSelected_RendersChecked`
  - [ ] `TableHeaderSelection_Toggle_SelectsAndClearsAllRows`
  - [ ] `TableGroupSelection_SomeDescendantsSelected_RendersIndeterminate`
  - [ ] `TableGroupSelection_CollapsedGroupToggle_SelectsAllDescendantLeaves`
  - [ ] `TableGroupSelection_NestedGroups_UsesAllDescendantLeaves`
  - [ ] `TableRowSelection_SelectedRowDeleted_RemovesSelectionAndUpdatesTriState`
  - [ ] `TableRowSelection_LockedView_HidesControlsAndClearsSelection`
  - [ ] `TableRowSelection_LayoutRoundTrip_RestoresSelectedTableUI`
  - [ ] `TableRowSelection_ColumnResizeActive_UpdatesSelectionUI`
  - [ ] `TableRowSelection_MobileView_KeepsSelectionAndActionControlsVisible`
- [ ] Remove redundant tests that do not prove a production behavior or non-obvious contract.
- [ ] Keep assertions focused; do not snapshot unrelated Tailwind classes.

## Phase 6: Verification

- [ ] Load nvm and select Node.js `24.11.1`.
- [ ] Confirm `$NVM_BIN/pnpm --version` is `11.0.8`.
- [ ] Confirm the pnpm store is `/Users/awen/Documents/Codex/.pnpm-store`.
- [ ] Run `CI=true $NVM_BIN/pnpm -F @notion-kit/table-hook test -- --run`.
- [ ] Run `CI=true $NVM_BIN/pnpm -F @notion-kit/table-view test -- --run`.
- [ ] Run `$NVM_BIN/pnpm -F @notion-kit/table-hook typecheck`.
- [ ] Run `$NVM_BIN/pnpm -F @notion-kit/table-view typecheck`.
- [ ] Run `$NVM_BIN/pnpm -F @notion-kit/table-hook lint`.
- [ ] Run `$NVM_BIN/pnpm -F @notion-kit/table-view lint`.
- [ ] Run `$NVM_BIN/pnpm -F @notion-kit/table-hook format`.
- [ ] Run `$NVM_BIN/pnpm -F @notion-kit/table-view format`.
- [ ] Manually verify desktop selection, Shift range, header all/none, group tri-state, collapsed groups, locking, layout round-trip, and mobile visibility.
- [ ] Confirm no bulk-edit UI or public row-selection props were added.
- [ ] Mark the implementation ready for code review.
