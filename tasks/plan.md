# Implementation Plan: Multi-row Sortable

## Overview

Implement selected-row multi-drag as an opt-in `Sortable.Root` capability, then
wire it into table, list, and timeline-sidebar row sorting. A cross-group drop
will move the selected visible rows as one ordered block and update every moved
row's grouping value in one resource change.

## Architecture decisions

- `Sortable.Root` owns the selection snapshot and transient group-drag state;
  callers supply only `multiDrag.selectedIds`.
- `Sortable.Item` adds namespaced drag metadata and a group-drag data attribute
  automatically. Existing consumer item data remains intact.
- The existing sortable reorder helper is the one algorithmic entry point. It
  branches to a stable multi-item move only for valid primitive metadata.
- `data.row.move` remains the single-row compatibility contract. A new
  `data.rows.move` action represents one atomic multi-row move.
- Rows outside the current rendered sortable collection are filtered out before
  reordering, preventing hidden selected rows from moving unexpectedly.

## Dependency graph

```text
Sortable metadata + stable group-move helper
        |
        +--> table-hook batch reorder / cross-group data transaction
                   |
                   +--> table, list, timeline-sidebar Root opt-in
                                  |
                                  +--> focused interaction regression tests
```

## Task list

### Phase 1: Sortable foundation

## Task 1: Add opt-in multi-drag metadata and stable reorder

**Description:** Extend `Sortable.Root` and `Sortable.Item` so a selected
source captures the selected ids, all captured items expose group-drag state,
and `getSortableItemsAfterDrag` moves that group as a stable contiguous block.

**Acceptance criteria:**

- [ ] `multiDrag={{ selectedIds }}` is optional and normal sortable consumers
  preserve existing behavior.
- [ ] Dragging a selected item carries the selected ids; an unselected item
  carries only its own id.
- [ ] A non-contiguous selected group preserves its original item order after a
  projected move; cancelled and malformed metadata leave the items unchanged.

**Verification:**

- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/ui test -- sortable.test.ts`
- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/ui typecheck`

**Dependencies:** None

**Files likely touched:**

- `packages/ui/src/primitives/sortable.tsx`
- `packages/ui/src/primitives/sortable.test.ts`

**Estimated scope:** Small

### Phase 2: Atomic table data transaction

## Task 2: Commit a multi-row reorder as one table resource action

**Description:** Teach the table hook to read sortable multi-drag metadata,
reorder the visible selected rows together, and emit a batch action without
changing the legacy single-row action.

**Acceptance criteria:**

- [ ] A multi-row reorder changes the rows once and emits `data.rows.move`
  with every affected row's previous and next position.
- [ ] A cross-group drop updates each moved row's grouping cell, preserves the
  block's relative order, and runs grouping synchronisation once.
- [ ] Invalid or cancelled events do not write data; a single-row event still
  emits the established `data.row.move` action.

**Verification:**

- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test -- row-actions.test.tsx`
- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook typecheck`

**Dependencies:** Task 1

**Files likely touched:**

- `packages/table-hook/src/features/row-actions.ts`
- `packages/table-hook/src/table-contexts/actions.ts`
- `packages/table-hook/src/__tests__/row-actions.test.tsx`

**Estimated scope:** Medium

### Checkpoint: Core data flow

- [ ] UI and table-hook focused tests pass together.
- [ ] Single-row resource-action assertions remain unchanged.
- [ ] A controlled consumer receives exactly one batch action for a multi-drag.

### Phase 3: View integration

## Task 3: Opt table, list, and timeline sidebar into multi-drag

**Description:** Supply the current selection to each sortable row collection
and apply the primitive's group-drag state to the existing row visuals without
changing board or timeline cards.

**Acceptance criteria:**

- [ ] Table body, list content, and timeline sidebar all opt in using the same
  Root API.
- [ ] Selection is evaluated from current view state, so locked views still do
  not begin drags and collapsed rows are excluded.
- [ ] Existing single-row dragging and sorted-drag confirmation UI continue to
  work in all three layouts.

**Verification:**

- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view test -- sorted-row-drag.test.tsx`
- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view typecheck`

**Dependencies:** Tasks 1-2

**Files likely touched:**

- `packages/table-view/src/table-body/table-body.tsx`
- `packages/table-view/src/list-view/list-view-content.tsx`
- `packages/table-view/src/timeline-view/timeline-sidebar.tsx`

**Estimated scope:** Small

### Phase 4: Behavioural regression suite

## Task 4: Add focused end-to-end view coverage

**Description:** Exercise real selected-row drag behavior through the public
TableView surface. Keep the suite deliberately small: it validates each view's
wiring and the highest-risk sorted confirmation path, while pure ordering and
data changes stay in their lower-level suites.

**Acceptance criteria:**

- [ ] A parameterized table/list/timeline-sidebar test proves that dragging a
  selected row commits all selected visible rows together.
- [ ] A grouped cross-group test proves that every selected row receives the
  target group value and the emitted action is a single batch move.
- [ ] One sorted multi-drag test proves no data is written before confirmation
  and the confirmed action remains a batch move.

**Verification:**

- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view test -- multi-row-drag.test.tsx sorted-row-drag.test.tsx`
- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view typecheck`

**Dependencies:** Tasks 1-3

**Files likely touched:**

- `packages/table-view/src/__tests__/multi-row-drag.test.tsx`
- `packages/table-view/src/__tests__/component-objects/*` (only if the current
  objects cannot express row selection or a real pointer drag)

**Estimated scope:** Medium

### Checkpoint: Complete

- [ ] Focused UI, table-hook, and table-view suites pass.
- [ ] Package typechecks pass for UI, table-hook, and table-view.
- [ ] Formatting and lint pass for changed packages.
- [ ] Manual Storybook check confirms the multi-drag state visually hides the
  complete dragged group and existing drag handles remain usable.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Projected dnd-kit index is local to a group | Incorrect insertion point | Centralize block insertion beside the existing projected-group helper and use group-local indices only there. |
| Selected ids are stale or hidden | Surprise movement | Filter against the current sortable rows; fall back to the active row. |
| Batch action breaks controlled consumers | High | Add a discriminated `data.rows.move` action while retaining the legacy single-row shape and verify public callbacks. |
| Repeated view tests duplicate algorithm coverage | Low | Keep ordering logic in primitive/table-hook tests; view tests cover wiring and confirmation only. |

## Test suite rationale

| Suite | High-value contract | Deliberately excluded |
| --- | --- | --- |
| `sortable.test.ts` | Stable group insertion, fallback, cancellation | Dnd-kit sensor internals and CSS class snapshots |
| `row-actions.test.tsx` | Atomic data mutation, exact batch action, group-value changes | Re-testing all existing single-row group permutations |
| `multi-row-drag.test.tsx` | Public selection-to-drag integration for the three supported layouts | Board/timeline-card behavior, already out of scope |
| `sorted-row-drag.test.tsx` | Confirmation gate remains before persistence | Duplicate unit checks of reordering math |

## Open questions

None. The agreed policy is to move all selected rows currently present in the
sortable collection, including across groups.
