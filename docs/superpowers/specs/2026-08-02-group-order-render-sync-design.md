# Group Order Render Synchronization

## Problem

Reordering groups from the Edit Group menu can finish as a projected
self-target drag: `source.id === target.id` while
`source.initialIndex !== source.index`. `handleGroupedRowDragEnd` currently
rejects every self-target before delegating to the shared sortable helper, so
the grouping state never receives the new order and the rendered layouts have
no state change to display.

This is a drag-end handling bug, not a grouped-row-model invalidation bug.
`getExtendedGroupedRowModel` already memoizes on `groupOrder` and applies that
order to its grouped rows. Table and list subscribe to `groupingState`; board
renders directly from `groupOrder`.

## Design

Keep `EditGroupMenu` and `getExtendedGroupedRowModel` unchanged. Update only
`handleGroupedRowDragEnd` in the table grouping feature:

1. Read the current `groupOrder`.
2. Delegate the complete drag event to `getSortableItemsAfterDrag`.
3. If the helper returns the same array reference, treat the event as a no-op
   and do not emit a grouping-state update.
4. Otherwise write the returned order into `groupingState`.

This makes the shared sortable primitive the single source of truth for
canceled, incomplete, ordinary cross-target, and projected self-target drag
semantics. It also preserves the existing contract that a true no-op does not
invoke the state callback.

## Tests

### Table-hook unit tests

- A projected self-target drag (`initialIndex: 0`, `index: 1`) updates
  `groupOrder`.
- After that update, `table.getRowModel().rows` exposes the same group order,
  proving the grouped-row model reacts correctly.
- Canceled, incomplete, and true self-target/no-index events preserve the
  current order without invoking `onGroupingStateChange`.

### Browser tests

Use a real pointer drag on the Edit Group menu and assert that group display
order updates for table, list, and board layouts. Also assert that the order is
preserved while switching layouts.

## Scope

- No changes to menu markup or sortable primitives.
- No changes to grouped-row-model implementation.
- No keyboard DnD expansion beyond existing primitive behavior.
- No unrelated grouping or layout refactors.
