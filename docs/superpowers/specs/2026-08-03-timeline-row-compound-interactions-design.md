# Timeline Row Compound Interactions Design

## Goal

Correct the Timeline range selector, jump positioning, row opening, dragging,
and row-action context menu while replacing the coupled `TimelineRow` render
callback API with composable compound components.

## Confirmed Behavior

- The active Timeline range option shows the Select check indicator.
- Jumping to an item positions its start immediately to the right of the open
  sidebar rather than underneath it.
- An unlocked Timeline item is draggable from the whole card, resizable from
  its edges, clickable to open the configured row view, and usable as the
  trigger for the row action context menu.
- A locked Timeline item supports only card click. It has no drag, resize, or
  context-menu interaction.
- A drag gesture crossing the activation threshold does not also open the row.

## Compound Component API

Replace the current monolithic function with a `TimelineRow` compound export.
Its intended table-view composition is:

```tsx
<TimelineRow.Root item={feature} onMove={updateRange}>
  <TimelineRow.Jump />
  <TimelineRow.Track>
    <TimelineRow.Resize direction="start" />
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <TimelineRow.Item onClick={() => table.openRow(row.id)} />
        }
      >
        <TimelineBarContent title={title} />
      </ContextMenuTrigger>
      <ContextMenuContent className="w-[265px]">
        <RowActionMenu rowId={row.id} />
      </ContextMenuContent>
    </ContextMenu>
    <TimelineRow.Resize direction="end" />
  </TimelineRow.Track>
</TimelineRow.Root>
```

The locked composition omits capabilities rather than passing mode booleans:

```tsx
<TimelineRow.Root item={feature}>
  <TimelineRow.Jump />
  <TimelineRow.Track>
    <TimelineRow.Item onClick={() => table.openRow(row.id)}>
      <TimelineBarContent title={title} />
    </TimelineRow.Item>
  </TimelineRow.Track>
</TimelineRow.Root>
```

`TimelineRow.Item` is the only card surface. There is no `StaticCard` variant
and no internal drag-handle button. When `Root` receives `onMove`, `Item`
registers its entire surface as draggable. Without a move action it remains a
plain clickable item. The API uses children for content composition; the Base
UI `render` prop remains available only for element/trigger composition.

The old `<TimelineRow item onMove render />` API is removed. Registry examples,
documentation, tests, and table-view consumers migrate to the compound API in
the same change so there are not two competing composition models.

## State and Gesture Ownership

`TimelineRow.Root` provides a row-local context with three explicit sections:

- `state`: authoritative and draft start/end values plus gesture state.
- `actions`: begin, move, cancel, and commit operations.
- `meta`: item identity, range-derived geometry, and movability.

`Root` owns the row's single `DragDropProvider` and routes drag events by source
type. `Item` and `Resize` register drag sources against this provider; they do
not create nested providers. Draft dates remain local during a gesture and the
existing `onMove(id, start, end)` contract commits once at the end. Canceled or
rejected controlled moves restore authoritative coordinates.

The provider keeps the existing horizontal restriction and pointer activation
distance. Click is attached to `TimelineRow.Item`, not to its title content, so
the full card opens the row while an activated drag does not.

## Context Menu Composition

The Timeline primitive does not import or know about table row actions. The
table-view consumer composes `ContextMenuTrigger` over `TimelineRow.Item` using
Base UI's `render` API and renders the existing `RowActionMenu` in a
`ContextMenuContent` surface.

Only the unlocked table-view composition includes this wrapper. Right click or
long press therefore exposes the same actions as other row action menus without
adding row IDs or table APIs to the Timeline package.

## Jump and Range Corrections

`scrollToFeature` computes the target as the feature start offset minus the
current sidebar width, clamped to zero. The resulting item viewport position is
the sidebar's inline end. Range changes continue to preserve the visible center
date.

`TimelineRangeSelect` stops passing `hideCheck` to `SelectItem`, restoring the
primitive's selected-item indicator without custom icon markup.

## Slot Migration

Any touched Timeline element whose compatibility slot starts with `notion-`
moves that value from `data-slot` to `data-notion-slot` and receives a new
Timeline-specific slot:

| Element | Compatibility attribute | Public Timeline slot |
| --- | --- | --- |
| Positioned item frame | `data-notion-slot="notion-timeline-item"` | `data-slot="timeline-item"` |
| Interactive card surface | `data-notion-slot="notion-timeline-item-properties"` | `data-slot="timeline-item-card"` |
| Outer row track wrapper | none | `data-slot="timeline-item-track"` |

Tests and consumers use the new `data-slot="timeline-*"` values. The
`data-notion-slot` values are retained only as compatibility/styling hooks and
are never used as the primary test contract.

## Testing

Follow red-green-refactor and keep each regression independently observable.

### UI package

- The active range item exposes its check indicator.
- Jumping with a sidebar scrolls to `itemOffset - sidebarWidth`.
- `TimelineRow.Item` is the whole drag surface and renders no drag handle.
- Item click fires below the drag threshold and does not fire after an
  activated drag.
- Root, Jump, Track, Item, and Resize compose from shared row state.
- The new Timeline slots and compatibility attributes appear together.

### Table-view package

- Clicking empty space on the card, not only its title, opens the row view.
- Right-clicking an unlocked item opens `RowActionMenu` for the matching row.
- Dragging the card commits the exact Date cell envelope without opening the
  row or the context menu.
- Locked items open on click and expose no resizers, draggable registration,
  drag handle, or context menu.

Existing provider, drag/resize, controlled-resource, registry, typecheck, and
browser Timeline coverage remains green after consumer migration.

## Non-goals

- No change to row action commands or their resource behavior.
- No new Timeline-specific menu implementation.
- No change to sidebar row reordering.
- No redesign of Timeline date conversion, range geometry, or resize snapping.

## Acceptance Criteria

- All five reported UI problems are covered by failing tests before their
  production fixes.
- Timeline row composition no longer depends on an item-content render callback
  or a static/draggable component branch.
- The whole unlocked card is draggable, clickable, and context-menu composable.
- The locked card is click-only.
- No touched element retains a `notion-*` value in `data-slot`.
- Focused tests, package tests, typechecks, lint, and relevant browser
  verification pass.
