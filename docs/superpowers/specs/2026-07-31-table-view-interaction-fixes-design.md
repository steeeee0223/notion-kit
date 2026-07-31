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

Implementation follows red-green-refactor. Regression tests must fail against the current implementation before production code changes.

Unit and component tests cover:

- The header property trigger is the sortable handle and no separate `Move <property>` control is required.
- Locked open-row property labels and values cannot open interactive surfaces or emit updates.
- Table, list, and board row entry points open the configured row view without nested-trigger double activation.
- The shared row action handler updates a grouping cell for generic table/list DnD, preserves same-group values, and retains Kanban behavior.

Playwright tests cover:

- Pointer dragging from the header property trigger reorders columns, and clicking the same trigger opens its menu.
- Grouped table and grouped list rows can be moved to another group and controlled data contains the target grouping value.
- Table, list, and board layouts can open their configured row view.
- A locked open row does not allow property-name or property-value triggers to open.

Keyboard header DnD may retain a test if the composed primitive supports it reliably, but it is not required for acceptance.

## Acceptance criteria

- The header matches the Notion interaction model: the property label surface is the draggable menu trigger, without a separate handle.
- Locked open rows expose no editable property trigger.
- Row opening works in table, list, and board layouts.
- Cross-group DnD in table and list updates the underlying grouping cell and rendered group membership.
- Relevant unit, e2e, typecheck, and lint checks pass.
