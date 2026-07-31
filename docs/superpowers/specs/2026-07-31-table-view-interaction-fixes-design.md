# Table View Interaction Fixes

## Goal

Restore Notion-like table interactions and make row opening, locked pages, and grouped row drag-and-drop consistent across supported layouts.

## Scope

This change covers four behaviors:

1. The table header property trigger is also the column drag handle. There is no separate visible drag handle.
2. Every interactive property trigger inside an open row is disabled while the view is locked.
3. Rows can open the configured `RowView` from table, list, and board layouts.
4. In grouped table and list layouts, moving a row into another group updates both row order and the grouping cell value.

Unrelated table styling and a broader DnD architecture rewrite are out of scope.

## Header interaction

`TableHeaderCell` will compose `DropdownMenuTrigger` with `Sortable.Handle` so one accessible button owns both behaviors. A click opens the property menu; a pointer movement that crosses the sortable activation threshold starts column dragging. The resize separator remains an independent control and must not start a column drag.

Pointer drag-and-drop is required. Existing keyboard drag support should be preserved when composition allows it, but keyboard DnD is not a release requirement for this fix.

When the table is locked, the combined header trigger is disabled, which blocks both the property menu and column dragging.

## Locked open-row behavior

The open-row property list reads the table's locked state at its boundary and passes it to every interactive property surface:

- Property-name dropdown triggers are disabled.
- Property-value cell triggers and nested editors are disabled.
- No disabled trigger can open a menu, popover, combobox, or date picker, and no data update is emitted.

Row navigation remains available: previous row, next row, and close are navigation controls rather than property-editing triggers.

## RowView entry points

The primary row surface opens the configured row view in every layout:

- Table: the existing title-cell Open action and row actions continue to work.
- List: clicking the row surface opens the row.
- Board: clicking or keyboard-activating the card surface opens the row.

Nested editing and action triggers stop propagation so editing a cell or opening row actions does not also open the row. Side and center views render in place; full-page mode continues to follow the existing row URL behavior.

## Grouped row drag-and-drop

Table and list sortable rows already know their current `groupId`. Their DnD data contract will expose that identifier consistently to the shared row action handler.

On drag end, the handler will:

1. Resolve the source and target group from generic sortable row data or Kanban column data.
2. Apply the requested row reorder when the layout supports reordering.
3. When the target group differs from the source group, clone the target group's original grouping value into the moved row's grouping cell.
4. Refresh the grouping model and emit the existing `data.row.move` resource action.

A drop that is canceled, lacks a valid target group, or remains inside the same group must not change the grouping cell. Board keeps its existing preview and commit flow while sharing the same final group-resolution contract.

## Testing

Implementation follows red-green-refactor. Each regression test must fail for the intended missing behavior before production code changes. The suite is divided by the narrowest layer that can observe each contract, and it avoids duplicating behavior already covered by an existing test.

### Table-hook unit suite

File: `packages/table-hook/src/__tests__/row-actions.test.tsx`

These tests call the real `handleRowDragEnd` API with generic sortable row data. They verify data mutation independently from React rendering and pointer sensors.

- `HandleRowDragEnd_GenericSortableCrossGroup_UpdatesGroupingCellAndMoveResource`
  - Use table/list-shaped source and target data with different `groupId` values.
  - Assert the moved row receives the target group's original value, its other cells remain unchanged, rendered group membership changes, and exactly one `data.row.move` action is emitted.
  - Parameterize populated and null target groups because null is a valid group boundary, not a missing configuration.
- `HandleRowDragEnd_GenericSortableSameGroup_PreservesGroupingCell`
  - Assert an in-group reorder changes order without replacing the grouping cell id or value.
- `HandleRowDragEnd_UnknownTargetGroup_PreservesGroupingCell`
  - Supply a target `groupId` that is absent from `groupValues`.
  - Assert the handler does not manufacture a grouping cell with `undefined` data.

Existing ungrouped reorder, canceled Kanban preview, empty Kanban column, and Kanban cross-group tests remain the authority for those paths. They must not be copied into a second generic-row suite.

### Table-view integration suite

Files: `packages/table-view/src/__tests__/layout-interactions.test.tsx` and a focused row-view test file if the existing file becomes difficult to navigate.

- `ViewProps_LockedView_DisablesEveryPropertyTrigger`
  - Render a real open row with `locked: true` and the complete plugin fixture.
  - For property-name triggers, assert native disabled semantics and that no property menu opens.
  - For property-value triggers, assert `aria-disabled="true"`, removal from the tab order, and that programmatic activation cannot open an editor or emit `data.cell.update`.
  - Use table rows for the interactive plugin families rather than separate copy-pasted tests. Read-only display plugins need no activation test.
- `ViewProps_UnlockedView_PropertyTriggerStillOpens`
  - One representative property label and one representative value prove the locked guard was not accidentally made unconditional.

Existing tests already prove `ListRow_Click_OpensConfiguredRowView`, `BoardCard_Click_OpensConfiguredRowView`, board keyboard activation, and nested board controls not opening a row. Those tests are retained rather than recreated. A new component-level layout matrix is not added unless a production change introduces a new shared row-entry component.

Header composition is not tested by asserting that a `Move <property>` element is absent. That would be a structure-change detector. The observable click-versus-drag behavior is covered in Playwright instead.

### Playwright browser suite

File: `apps/e2e/tests/drag-and-drop.spec.ts`

- `HeaderTrigger_ClickAndPointerDrag_OpensMenuThenReordersProperty`
  - Click the `Notes` header and assert its real property menu opens.
  - Close the menu, then begin a pointer drag from the same `Notes` locator and drop after `Score`.
  - Assert rendered order, controlled property order, and the exact `properties.move` action.
  - This replaces `HeaderKeyboardDnD_NotesAfterScore_MovesPropertyAndReportsAction` as the required regression. A keyboard sub-test may remain only if the composed trigger supports it without a second handle.
- `GroupedRowDnD_<layout>CrossGroup_UpdatesRenderedMembershipAndControlledValue`
  - Parameterize `table` and `list` layouts.
  - Group by Status, drag `Alpha` from Active onto a row in Done, and assert it disappears from Active, appears in Done, and controlled data contains `status: "Done"`.
  - Assert one `data.row.move` action so a UI-only regroup cannot satisfy the test.

File: `apps/e2e/tests/layouts-and-row-views.spec.ts`

- `RowViewEntry_<layout>PrimarySurface_OpensConfiguredView`
  - Parameterize table, list, and board setup while keeping the assertion identical.
  - Activate the layout's primary row/card surface and assert the side dialog plus `openedRowId` controlled state.
  - The existing table-only open-row assertion in the controlled-resource test should be moved into this matrix, not duplicated.
- `LockedRowView_PropertyTriggersRemainClosedAndDataUnchanged`
  - Add a deterministic e2e fixture action that opens a row with `locked: true`; this avoids force-clicking through a modal or depending on hidden controls.
  - Assert every property-name trigger is disabled and every property-value trigger is semantically disabled and outside the tab order.
  - Attempt activation of representative label, text, select, checkbox, and date triggers. Assert no menu, textbox, combobox, or date picker appears and `dataCount` remains unchanged.
  - Assert previous, next, and close navigation still work to protect the intentional locked-state exception.

The existing side/center/full display-boundary and previous/next navigation tests remain in place. They test RowView modes and navigation, not layout entry points.

### Mutation checks

Before completion, mentally or temporarily apply these realistic regressions and confirm at least one named test fails:

- Restore the separate header drag handle or remove sortable listeners from the header trigger.
- Ignore generic `groupId` while retaining Kanban `columnId` support.
- Replace a grouping value during a same-group reorder.
- Accept an unknown target group and write `undefined` into the grouping cell.
- Forget to disable the property-name trigger while leaving value cells disabled.
- Leave one nested editor active in a locked RowView.
- Remove `openRow` from either list or board while table continues to work.

Concurrency and maximum-size cases are not added: these interactions commit one synchronous controlled-resource update and have no size-dependent branch. Dependency failure is represented by the unknown target-group test, the only missing-configuration path introduced by this change.

## Acceptance criteria

- The header matches the Notion interaction model: the property label surface is the draggable menu trigger, without a separate handle.
- Locked open rows expose no editable property trigger.
- Row opening works in table, list, and board layouts.
- Cross-group DnD in table and list updates the underlying grouping cell and rendered group membership.
- Relevant unit, e2e, typecheck, and lint checks pass.
