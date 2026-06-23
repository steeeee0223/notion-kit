# dnd-kit Remaining Milestones Design

## Status

Approved scope, synchronized with `feat/dnd` at `e8d01d0` on 2026-06-23.

This document continues the original
[dnd-kit migration design](./2026-06-22-dnd-kit-migration-design.md). It covers
only milestones 4–6; milestones 1–3 are implemented and committed.

## Goal

Finish the monorepo-wide dnd-kit 0.5 migration by:

1. replacing board-view's legacy multiple-container implementation with the
   current controlled multiple-list model,
2. migrating the remaining free-form drag consumers directly to the current
   API, and
3. removing every legacy package, compatibility adapter, and import.

The migration must preserve existing product behavior and visual layout. It
must not introduce unrelated board, timeline, or demo features.

## Synchronized Current State

Milestones 1–3 delivered:

- dnd-kit 0.5 packages are installed beside the legacy packages,
- `Sortable.Root`, `Sortable.List`, `Sortable.Item`, `Sortable.Handle`, and
  `Sortable.Overlay` are exported from `@notion-kit/ui/primitives`,
- ordinary sortable rows, columns, menus, options, workspaces, and Storybook
  lists use the shared primitive,
- table ordering features accept ordered IDs, and
- the former Cool Todo local sortable abstraction is removed.

The worktree is clean. Formatting, linting, and typechecking pass for UI,
table-view, and Storybook. UI, table-view, and Storybook builds pass.

Known test-infrastructure failures remain outside this migration's scope:

- UI tests complete their assertions but report unhandled network failures
  while fetching Lucide metadata.
- Table-view has the accepted Base UI menu-interaction failure set.
- Storybook browser tests cannot start because the rsbuild preset is missing
  and the sandbox denies the test server port.

These failures must be tracked separately. Milestones 4–6 must add focused
tests that pass independently and must not increase the known failure set.

## Remaining Legacy Boundary

Legacy source usage is currently limited to:

- `packages/table-view/src/board-view/**`,
- `packages/table-view/src/common/dnd.tsx` and its barrel export,
- the temporary legacy table drag-event adapters in
  `packages/table-view/src/features/**`,
- `packages/ui/src/timeline/timeline-row/timeline-item.tsx`,
- `packages/ui/src/timeline/timeline-row/timeline-item-resizer.tsx`, and
- `apps/storybook/src/stories/blocks/falling-blocks.stories.tsx`.

Legacy package declarations remain in the UI, table-view, Storybook, and e2e
manifests and in the workspace catalog.

## Delivery Strategy

Use three independently verifiable milestones.

### Selected: staged migration

Migrate board-view, then free-form consumers, then remove compatibility code
and dependencies. Each milestone must leave the repository buildable.

This sequence isolates the riskiest state transition and prevents dependency
removal from obscuring behavioral regressions.

### Rejected: one large cutover

Migrating board, timeline, demos, adapters, and manifests together would make
failures difficult to localize and the change difficult to review or revert.

### Rejected: retain the compatibility bridge

Keeping legacy adapters and packages after source migration would preserve two
event models indefinitely and would fail the monorepo-wide migration goal.

## Milestone 4: Board-View Multiple Sortable Lists

### State model

Board-view owns controlled interaction state with two structures:

```ts
type BoardItems = Record<string, string[]>;

interface BoardDndState {
  groupOrder: string[];
  items: BoardItems;
}
```

`groupOrder` is the horizontal column order. `items[groupId]` is the ordered
card-ID list for that group. The state is derived from the current grouped row
model when no card drag is active.

At card drag start, board-view snapshots `items`. During the active operation,
rendering uses the controlled mapping rather than `row.subRows`, so movement
between lists is immediately visible without persisting table data on every
hover.

### Registration

Use one current `DragDropProvider` for the whole board.

Groups register with current `useSortable` using:

- the group ID,
- an explicit index from `groupOrder`,
- type and accept metadata for board groups,
- the horizontal-axis modifier, and
- the table's locked state.

Cards register with current `useSortable` using:

- the row ID,
- an explicit index within `items[groupId]`,
- type and accept metadata for board cards,
- `group: groupId`, and
- the table's locked state.

Each group content area also registers a card droppable target. It must accept
cards with lower collision priority than registered card targets, allowing an
empty group to remain a valid destination without a placeholder-only collision
algorithm.

Group and card types never accept one another. A group drag cannot target a
card list, and a card drag cannot reorder groups.

### Drag lifecycle

For card operations:

1. On drag start, snapshot the current mapping and record the source card.
2. On drag over, call the current `move(items, event)` helper and update only
   the temporary mapping.
3. On canceled drag end, restore the snapshot without touching table data.
4. On successful drag end, flatten the final mapping in group order and call
   `table.handleRowOrderChange` once.
5. When the card's destination group differs from its source group, pass the
   moved row and destination group so the grouping cell is updated atomically
   with row order.

For group operations, calculate the next ordered group IDs and call
`table.handleGroupedRowOrderChange` once on successful completion.

Missing, duplicated, or stale source/target IDs are no-ops. Every transition
must preserve every known card exactly once.

### External synchronization

When no drag is active, changes from table state replace the controlled board
mapping. This covers row creation, deletion, filtering, grouping changes, and
external updates without retaining stale drag state.

During a drag, external removal of the source or target invalidates the
operation. Completion reconciles to current table state rather than committing
the stale snapshot.

### Rendering and overlay

Split the presentational card body from sortable registration. The source card
uses the sortable hook; the overlay renders only the presentation component.
There is exactly one overlay for the provider.

Card overlays preserve the current card appearance and pointer-event behavior.
Group dragging uses source feedback and does not add a group overlay.

The empty-group target replaces `PlaceholderBoardCard` as a DnD requirement.
A purely visual insertion indicator may remain if it is driven by current
drop-target state.

### Board tests

Extract pure board mapping helpers and test:

- same-group card reorder,
- cross-group card move,
- movement into an empty group,
- horizontal group reorder,
- cancellation rollback,
- missing or stale source/target IDs,
- destination grouping-cell updates,
- external-state reconciliation, and
- no lost or duplicated cards after every transition.

Add component smoke tests for group/card registration, explicit indexes,
locked behavior, empty targets, and the presentational-only overlay.

## Milestone 5: Remaining Free-Form Drag Consumers

Free-form drag consumers use the current provider and hooks directly. They do
not use the sortable primitive and do not introduce another shared abstraction.

### Timeline item movement

Replace legacy `DndContext`, sensors, `useDraggable`, utilities, and modifiers
in `timeline-item.tsx` with the current API.

Preserve:

- horizontal-only movement,
- the 10-pixel mouse activation threshold,
- current date snapping and delta calculations,
- temporary start/end rendering during a drag,
- one `onMove` commit at drag end, and
- timeline dragging-context updates.

Canceled operations restore the pre-drag dates and do not call `onMove`.

### Timeline item resizing

Migrate left and right resizers to current draggable registration and provider
events while preserving:

- horizontal restriction,
- the 10-pixel activation threshold,
- scroll and sidebar offset calculations,
- live timestamp feedback, and
- one resize completion callback.

Each resizer keeps a unique ID. A canceled resize restores the pre-drag value
and clears timeline dragging state.

### Falling Blocks Storybook example

Migrate the draggable Falling Blocks story to current `DragDropProvider`,
`useDraggable`, and `useDroppable` APIs.

Use current operation transform data for the physics delta, current state names
such as `isDragging` and `isDropTarget`, and the current parent-element
restriction. A canceled operation follows the same physics cleanup path as a
completed drag without introducing legacy `onDragCancel` semantics.

The non-draggable Basic story remains unchanged.

### Free-form tests

Add focused tests for:

- timeline move start, live delta, completion, and cancellation,
- left and right resize completion and cancellation,
- activation-constraint configuration,
- Falling Blocks drag start/move/end translation, and
- disabled or absent callback behavior.

Use semantic provider callbacks and hook wiring instead of brittle pointer
coordinate simulations.

## Milestone 6: Legacy Removal And Final Verification

### Remove compatibility code

After milestones 4 and 5 have no legacy source imports:

- delete `packages/table-view/src/common/dnd.tsx`,
- remove its barrel export,
- remove `handleColumnDragEnd`, `handleGroupedRowDragEnd`, and
  `handleRowDragEnd`,
- remove `createDragEndUpdater`, and
- remove all legacy drag-event types and array helpers from table features and
  tests.

Ordered-ID APIs remain the table model's only ordering contract.

### Remove dependencies

Remove these legacy packages from every manifest and the UI catalog:

- `@dnd-kit/core`,
- `@dnd-kit/modifiers`, and
- `@dnd-kit/sortable`.

Remove unused current packages only when an import audit proves they are no
longer required. Regenerate `pnpm-lock.yaml` and run workspace dependency
consistency checks.

The e2e application currently declares legacy packages without source imports;
those declarations are removed as part of this milestone.

### Final audit

The following search must return no source or manifest matches:

```sh
rg '@dnd-kit/(core|modifiers|sortable)|SortableDnd|useDndSensors' packages apps
```

The final tree must contain one DnD API generation only. No temporary adapters,
duplicate sortable abstractions, or event-shape translators remain.

### Verification gates

Run, in order:

1. focused board and free-form unit tests,
2. UI, table-view, Storybook, and e2e formatting and linting,
3. affected workspace typechecks,
4. UI, table-view, Storybook, and e2e builds,
5. full unit and browser test suites when their known infrastructure failures
   are repaired, and
6. manual browser verification of the interaction matrix below.

The migration may be reviewed while known infrastructure failures remain, but
it cannot introduce new failures. The final handoff records exact passing and
known-failing commands rather than treating baseline failures as migration
regressions.

## Browser Verification Matrix

Verify:

- board group movement by mouse and keyboard,
- card reorder within one populated group,
- card movement across populated groups,
- card movement into an empty group,
- Escape cancellation and snapshot restoration,
- locked board behavior,
- overlay appearance and cleanup,
- timeline item movement,
- left and right timeline resizing, and
- Falling Blocks dragging within its parent bounds.

Clicking card controls, row menus, timeline content, or workspace controls must
not accidentally start a drag.

## Scope Boundaries

In scope:

- current dnd-kit API migration for every remaining consumer,
- pure state helpers required for board correctness,
- presentational splits required to keep overlays hook-free,
- focused migration tests,
- removal of legacy adapters and dependencies, and
- final monorepo verification.

Out of scope:

- visual redesigns,
- changes to board grouping or persistence semantics beyond atomic drag
  commits,
- new board capabilities,
- a universal abstraction for non-sortable dragging,
- repair of the accepted Lucide, Base UI menu, or Storybook test-infrastructure
  failures, and
- unrelated table-view, timeline, or Storybook refactors.

## Completion Criteria

The remaining migration is complete when:

- board groups and cards use the current controlled multiple-list model,
- card movement is correct within, across, and into empty groups,
- cancellation and stale-state handling are lossless,
- timeline movement and resizing retain their current behavior,
- the Falling Blocks example uses the current API,
- no legacy dnd-kit package, import, adapter, or helper remains,
- focused migration tests pass,
- formatting, linting, typechecking, and affected builds pass, and
- browser verification confirms pointer, keyboard, cancellation, locked, and
  overlay behavior.
