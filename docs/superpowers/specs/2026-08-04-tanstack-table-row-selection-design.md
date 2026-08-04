# TanStack Table Row Selection Design

## Goal

Integrate TanStack Table's row-selection feature into `@notion-kit/table-hook` and connect it to the table-view row, group, and header checkboxes. This establishes the internal selection state required by a future bulk-edit feature without adding bulk-edit UI or a public selection-state API in this change.

## Scope

This design covers:

- Registering TanStack's `rowSelectionFeature` in the table-hook feature set.
- Keeping row-selection state internal and uncontrolled for the lifetime of a mounted `TableView`.
- Connecting leaf-row, grouped-row, and table-header checkboxes to that state.
- Rendering checked, unchecked, and indeterminate checkbox states.
- Keeping all `TableRowActionGroup` instances visible while any row is selected.
- Removing selection IDs when their source rows are deleted.
- Clearing and hiding selection when the table is locked.
- Preserving selection across layout changes within the same mounted table instance.
- Adding focused tests for state ownership, lifecycle, grouping, rendering, and interaction behavior.

## Non-Goals

This change does not:

- Add bulk-edit controls or bulk-edit operations.
- Add controlled, default, or callback props for row selection.
- Persist selection outside the mounted table instance.
- Add row-selection UI to List, Board, or Timeline layouts.
- Change filtering or pagination behavior.
- Redesign existing row, group, or header actions beyond their selection-driven visibility.

## State Ownership

`rowSelectionFeature` will be registered in `DEFAULT_FEATURES`. The feature's `rowSelection` state remains owned by the table instance and starts as an empty ID map on each mount.

The public `TableView` and `useTableView` props will not expose `rowSelection`, `defaultRowSelection`, or `onRowSelectionChange`. Callers can use the table instance's existing TanStack APIs, including `getSelectedRowIds()` and selected-row models, when the future bulk-edit feature is implemented, but callers cannot control the state lifecycle.

The existing `getRowId: (row) => row.id` remains the identity source. Selection records contain only real data-row IDs. Grouping-generated synthetic IDs are never retained in `rowSelection`.

Selection persists when the mounted table switches between Table, List, Board, and Timeline layouts. Unmounting the table creates a new empty selection state on the next mount.

## State Cleanup

Whenever the data resource changes, row selection is intersected with the current set of data-row IDs. IDs for deleted rows are removed immediately, including rows deleted through grouped actions or external controlled-data updates. This prevents stale, invisible records from participating in future bulk operations or becoming selected again if an ID is reused.

When the view changes from unlocked to locked, row selection is reset to empty. While locked, header, group, and leaf selection controls are not rendered and cannot mutate selection.

Cleanup must avoid an update when the selected ID map is already valid and must not affect sorting, grouping, expansion, or layout state.

## Selection Semantics

### Leaf Rows

Each real data row renders a controlled checkbox:

- `checked` reflects `row.getIsSelected()`.
- Clicking uses TanStack's row toggle handler so ordinary multi-selection and inclusive Shift-range selection retain TanStack behavior.
- Sorting changes display order but does not change selected IDs.

Each checkbox has a unique accessible name associated with its row. The current repeated `id="row-select"` value is removed or replaced with unique IDs so labels never target the wrong control.

### Table Header

The header checkbox summarizes all selectable real data rows:

- No selected rows: unchecked.
- Some, but not all, rows selected: indeterminate.
- All selectable rows selected: checked.
- No rows: unchecked.

Clicking the header checkbox selects all or clears all selectable data rows. Its scope does not depend on sorting or whether grouped descendants are expanded or collapsed.

TanStack v9's `getIsSomeRowsSelected()` means at least one row is selected, including the all-selected case. The indeterminate state is therefore calculated as:

```ts
table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
```

### Group Rows

Every grouped row renders a tri-state checkbox that has the same semantics as the ungrouped table header, scoped to all selectable descendant leaf rows:

- No descendant selected: unchecked.
- Some descendants selected: indeterminate.
- Every descendant selected: checked.

Clicking an unchecked or indeterminate group selects every descendant leaf. Clicking a checked group clears every descendant leaf. This includes descendants hidden by a collapsed group and works recursively for multi-level grouping.

Group interactions update leaf IDs directly rather than storing the group's synthetic ID. Expanding, collapsing, sorting, or regrouping therefore does not alter selection identity.

## Visibility Rules

`rowSelection` is the sole source for the global `hasSelection` condition. The relevant table subscriptions derive this boolean and pass it explicitly to the header, grouped rows, leaf rows, and action groups.

### Desktop

- Every `TableRowActionGroup` starts at `opacity-0`.
- Existing reveal conditions remain: row hover, row dragging, or an open action popover.
- Once any row is selected, every `TableRowActionGroup` becomes `opacity-100`.
- This applies to both selection-checkbox groups and add/drag row-action groups.
- Header and group selection controls start at `opacity-0`, appear on their respective hover surface, and remain `opacity-100` while any row is selected.

### Mobile

Mobile keeps the current touch-friendly exception: row action groups and all selection controls remain `opacity-100` because hover is not reliably available.

## Component and Reactivity Boundaries

`TableRowActionGroup` receives an explicit selection-driven visibility prop. It remains a presentational component and does not subscribe to table state itself. This avoids creating multiple table subscriptions per row and keeps state ownership visible to callers.

The existing body and header subscriptions add only the row-selection slice they require:

- The header derives its own checked, indeterminate, and visible values.
- The table body derives `hasSelection` and supplies the selection slice needed for row and group rendering.
- Leaf and group checkbox state is calculated from their row instances against the current selection slice.

The column-resize `MemoizedTableBody` must include selection in its render contract. Its comparison cannot continue to depend only on `table.options.data`, because that would leave checkbox state and action visibility stale during column resizing.

## Accessibility

- Header, group, and leaf controls have distinct accessible names.
- Group checkbox names identify the group they affect.
- Leaf checkbox names identify the row they affect.
- The visual indeterminate state is also exposed through the checkbox primitive's semantic state.
- Locked tables do not leave hidden, focusable selection controls in the DOM.

## Test Strategy

The suite follows the repository testing strategy: tests must guard production-relevant behavior, document a non-obvious contract, protect a known rendering regression, or validate interaction between real components. Tests use Arrange–Act–Assert and the `TestUnit_Scenario_ExpectedOutcome` naming format. Trivial TanStack getters and implementation-only class composition are not tested in isolation when the same behavior can be proven through the real table UI.

### Table-Hook State Contract

Add focused hook tests for:

- `UseTableView_RowSelectionWithoutPublicProps_OwnsInternalSelectionState`: proves selection starts empty and can be changed through the table instance without a public controlled-state prop.
- `UseTableView_SelectedRowRemoved_PrunesStaleSelectionId`: selects a row, removes it through a data update, and proves its ID is absent.
- `UseTableView_ViewBecomesLocked_ClearsSelectionState`: selects rows, locks the view, and proves selection becomes empty.
- `UseTableView_LayoutChanges_PreservesSelectionState`: changes layout within one mounted instance and proves selected IDs remain.
- `UseTableView_GroupToggle_SelectsOnlyDescendantLeafIds`: toggles a grouped row and proves the state contains leaf IDs rather than a synthetic group ID.

These tests validate lifecycle and identity contracts that are difficult to prove reliably through DOM-only assertions.

### Table-View Interaction Contract

Add real component interaction tests for:

- `TableRowSelection_RowCheckboxClick_TogglesSelectedState`.
- `TableRowSelection_ShiftClick_SelectsInclusiveDisplayedRange`.
- `TableRowSelection_OneSelectedRow_RevealsEveryRowActionGroup`.
- `TableHeaderSelection_NoRowsSelected_RendersUnchecked`.
- `TableHeaderSelection_SomeRowsSelected_RendersIndeterminate`.
- `TableHeaderSelection_AllRowsSelected_RendersChecked`.
- `TableHeaderSelection_Toggle_SelectsAndClearsAllRows`.
- `TableGroupSelection_SomeDescendantsSelected_RendersIndeterminate`.
- `TableGroupSelection_CollapsedGroupToggle_SelectsAllDescendantLeaves`.
- `TableGroupSelection_NestedGroups_UsesAllDescendantLeaves`.
- `TableRowSelection_SelectedRowDeleted_RemovesSelectionAndUpdatesTriState`.
- `TableRowSelection_LockedView_HidesControlsAndClearsSelection`.
- `TableRowSelection_LayoutRoundTrip_RestoresSelectedTableUI`.
- `TableRowSelection_ColumnResizeActive_UpdatesSelectionUI`.
- `TableRowSelection_MobileView_KeepsSelectionAndActionControlsVisible`.

Where checked, unchecked, and indeterminate cases share the same setup, use a table-driven test or focused sub-tests instead of duplicating entire fixtures. Styling assertions should target the actual visibility contract on rendered action groups; they should not snapshot unrelated Tailwind classes.

### Adversarial Cases

The tests explicitly exercise the most likely failure paths:

- Empty data must not report all selected.
- Selection cleanup must work for controlled data updates as well as internal delete actions.
- A collapsed group must not limit selection to mounted child rows.
- Nested groups must aggregate leaves recursively rather than only immediate children.
- Selection updates during memoized column-resize rendering must not be swallowed.
- Reused row IDs must not inherit selection after the original row was deleted.
- Locking after selection must not leave hidden selected IDs.

## Acceptance Criteria

- TanStack row selection is registered and internally owned with no new public selection props.
- Leaf, group, and header checkboxes accurately expose checked, unchecked, and indeterminate states.
- Header and group toggles operate on all relevant leaf rows, including collapsed descendants.
- Any active selection makes all `TableRowActionGroup` instances and selection controls fully visible on desktop.
- Mobile controls remain fully visible regardless of selection.
- Deleted row IDs are removed from selection, layout changes preserve selection, and locking clears selection.
- Checkbox labels are unique and accessible.
- Focused table-hook and table-view tests pass, including memoized resize behavior.
- Package typecheck, lint, and formatting checks pass for affected workspaces.

## Implementation Sequence

1. Register and verify internal TanStack row-selection state.
2. Add lifecycle cleanup for deleted rows and locked views.
3. Connect leaf and header checkboxes and global action visibility.
4. Add recursive grouped-row tri-state selection.
5. Protect memoized rendering and mobile/desktop visibility behavior.
6. Run focused tests and affected workspace quality checks.
