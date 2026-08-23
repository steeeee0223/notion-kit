# Multi-row Sortable Design

## Goal

Add an opt-in multi-item drag capability to `@notion-kit/ui/primitives` and
use it to move selected rows together in the table, list, and timeline sidebar
views. Board remains out of scope.

## User-visible behavior

- Dragging a selected row moves every selected row that is currently present in
  the sortable collection. Their existing relative order is retained.
- Dragging an unselected row moves only that row.
- A group is inserted as one contiguous block at the projected drop position.
- In a grouped view, dropping into another group changes the grouping value for
  every dragged row and inserts the block into that group.
- Selected rows that are not currently rendered (for example, inside a
  collapsed group) are not unexpectedly moved.
- Cancelling a drag leaves both order and group values unchanged.
- A sorted table, list, or timeline sidebar keeps the existing confirmation
  dialog. Confirming removal of sorting then commits the entire group move in
  one data update.

## Primitive API

`Sortable.Root` gains an optional `multiDrag` prop:

```tsx
<Sortable.Root multiDrag={{ selectedIds: table.getSelectedRowIds() }}>
  <Sortable.List>
    <Sortable.Item id={row.id} index={row.index}>...</Sortable.Item>
  </Sortable.List>
</Sortable.Root>
```

When configured, the root snapshots the source item and the applicable selected
item identifiers when a drag starts. Each `Sortable.Item` automatically:

- merges the snapshot into its dnd-kit data without overwriting consumer data;
- exposes group-drag state through render state and a `data-group-dragging`
  attribute, so consumers can hide every dragged source item consistently;
- continues to behave like a normal sortable item when its id is not selected.

The API intentionally requires no item-specific multi-drag props and no
consumer-managed drag state. It is a Root-level capability because selection is
collection state rather than item state.

`getSortableItemsAfterDrag` is extended to detect the primitive's namespaced
multi-drag metadata and invoke a stable group-move operation. It filters the
snapshot against the supplied items, which makes it safe for each layout to
provide its current sortable collection.

## Table data flow

The table hook reads the multi-drag identifiers from the drag event and uses a
single batch move operation rather than treating the source row as the only
changed row.

For an intra-group move, it reorders all dragged rows as one block. For a
cross-group move, it first computes the target order, then assigns the target
grouping value to every dragged row. Grouping state synchronisation occurs once
after the final data set is built.

The emitted resource action becomes a batch row-move action containing the
affected row ids and their before/after positions. This preserves one atomic
data-change boundary for controlled consumers and undo/redo. Existing single
row drags retain their existing action shape and behavior.

## Integration

The table body, list content, and timeline sidebar will subscribe to row
selection and opt in through `Sortable.Root`. Existing `Sortable.Item` call
sites require no multi-drag-specific data changes. The views continue to own
their presentation; the primitive supplies state attributes, rather than a
generic overlay that cannot render application-specific row content.

## Error handling and constraints

- Invalid, stale, or absent multi-drag data falls back to the current
  single-item behavior.
- If no selected id survives filtering to the visible collection, the active
  source item is used alone.
- Group changes occur only when a valid grouping column and target group value
  are present; otherwise the batch can only reorder.
- Locked views never start a drag, matching current behavior.

## Tests

1. Primitive unit tests cover stable group moves, an unselected source,
   filtered/stale selected ids, cancelled events, and normal single-item
   compatibility.
2. Table-hook tests cover a batch reorder and a cross-group batch move,
   including target grouping values and one batch resource action.
3. Table-view interaction tests cover table, list, and timeline sidebar:
   selected rows are moved together, sorted moves wait for confirmation, and
   cancelled drags do not persist changes.

## Scope

This change does not add multi-card dragging to board, date movement to timeline
cards, drag overlays, or a new selection model. It composes the existing row
selection state with sortable row reordering.
