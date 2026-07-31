# Task 4 report: browser coverage for grouped rows and RowView layouts

## Status

DONE

## Browser-first RED evidence

- `GroupedRowDnD_table_CrossGroupUpdatesRenderedMembershipAndControlledValue`
  and its list variant initially failed after a real pointer drag. The drag-end
  target remained `row-alpha`; table emitted no data action, while list only
  reordered rows. In both layouts Alpha's controlled Status stayed `Active`.
- `RowViewEntry_list_PrimarySurfaceOpensConfiguredView` initially failed when
  the test clicked the generic block center because that point activated a
  nested date editor. The behavior-oriented locator was corrected to click the
  list title surface, which already bubbles to the row entry handler. Table's
  title-cell `Open in side peek` action and the board card surface were already
  green.
- `LockedRowView_PropertyTriggersRemainClosedAndDataUnchanged` initially failed
  because the deterministic `Open locked Alpha row` parent-state fixture action
  did not exist. After adding that fixture action, the accessibility snapshot
  showed all labels and values disabled; a component-object scoping error was
  corrected without changing production lock behavior.
- A focused table-hook regression for a self-target event whose sortable group
  projected from `col2:25` to `col2:30` failed with the old value `25` before
  the handler change and passed with `30` afterward.

## Implementation

- Table and list sortable rows now publish their `row.parentId` through the
  dnd-kit `group` contract in addition to their existing data payload.
- The shared row drag-end handler reads `source.group` only when optimistic
  sorting reports a self-target and the group differs from `initialGroup`.
  Normal events continue to use target data, and the existing known-group guard
  still rejects invalid values.
- Added grouped table/list pointer scenarios. They assert drag cleanup,
  disappearance of the now-empty Active group, Done count `2`, Alpha rendered
  below the Done header, controlled Status `Done`, one data callback, and the
  exact `data.row.move` payload (`0 -> 1`).
- Added a table/list/board RowView entry matrix. Table uses the title-cell quick
  action; list uses its title surface; board uses the card surface. None use the
  row-actions menu. Removed the now-duplicated table-only opened-row assertion
  from the controlled-resource test.
- Added a deterministic locked-open-row scenario covering every property label
  and value trigger, representative activation attempts, zero data/property
  mutations, and working next/previous/close navigation.
- Extended the E2E component object with layout, grouping, row-block, RowView
  entry, and RowView property contracts.

## Verification

- Focused projected-group unit: 1 passed.
- `@notion-kit/table-hook` full suite: 8 files, 156 tests passed.
- `@notion-kit/table-view` full suite: 35 files, 326 tests passed.
- Focused grouped pointer E2E: 2 passed.
- Full `drag-and-drop.spec.ts` and `layouts-and-row-views.spec.ts`: 12 passed.
- Focused controlled layout/lock/rowView resource test: 1 passed.
- Typecheck: table-hook, table-view, and e2e passed.
- Lint: table-hook, table-view, and e2e passed.
- Format: table-hook, table-view, and e2e passed.
- `git diff --check`: passed.

## Self-review

- The projected group fallback is intentionally narrow: target id must equal
  source id, `source.group` must be a string, and it must differ from
  `source.initialGroup`.
- Existing generic target-data, Kanban, same-group, unknown-group, and null-group
  coverage remains authoritative and green.
- The enhanced cleanup assertions wait for both public sortable state and
  dnd-kit placeholder/drag state to disappear before checking rendered order.

## Concerns

- None blocking. The test server prints the existing `NO_COLOR`/`FORCE_COLOR`
  warning; it does not affect results.

## Review fix round 1

### Finding

The projected sortable `source.index` is local to the target group. Passing it
directly to the flat-row sortable helper placed Alpha before Omega and emitted a
`0 -> 1` action even when the pointer dropped after Omega.

### RED evidence

- The projected-group unit with flat data `Alpha, Empty, Omega` received
  `Empty, Alpha, Omega` instead of `Empty, Omega, Alpha`.
- An unknown projected group also flat-reordered the data instead of preserving
  it.
- Both grouped browser cases failed the new `Omega.y < Alpha.y` assertion when
  explicitly dropping after Omega.

### Fix

- Convert a valid projected target-group-local index into a flat insertion
  position by locating the target group's rows after removing the source.
- Keep normal and ungrouped drag events on `getSortableItemsAfterDrag`.
- Reject unknown projected source/target groups before any flat reorder or cell
  update.
- Strengthen grouped browser assertions with exact controlled IDs
  `row-empty,row-omega,row-alpha`, geometry, and action `0 -> 2`.
- Assert the locked date activation does not expose the date picker's
  `Go to the Next Month` control.
- Activate the board RowView from its stable title text surface.

### Verification

- Focused projected group unit: 2 passed, including the unknown-group guard.
- `@notion-kit/table-hook`: 8 files, 157 tests passed.
- `@notion-kit/table-view`: 35 files, 326 tests passed.
- Focused grouped table/list E2E: 2 passed.
- Full drag-and-drop and layouts/RowView specs: 12 passed.

## Review fix round 2

### Finding

Projected self-target detection only recognized a group change. A reorder within
the same group therefore sent the group-local projected index to the flat-row
helper, which is incorrect when raw rows from other groups are interleaved. The
projected trust boundary also allowed an unknown source group to update a cell
when the target group itself was known.

### RED evidence

- With raw order `A(X), B(Y), C(X)`, dragging A after C produced `B, A, C`
  instead of `B, C, A`.
- A projected event with unknown source group and known target group emitted a
  callback and changed A's grouping cell to the target value.

### Fix

- Recognize a projected self-target when either the sortable group or its local
  index differs from the complete initial group/index metadata.
- Route both cross-group and same-group projected events through the same
  group-aware local-to-flat translation.
- Apply the projected source/target group validity guard to both reorder and
  grouping-cell update paths.

### Verification

- Focused projected unit cases: 4 passed, covering cross-group, same-group,
  unknown target group, and unknown source group.
- Same-group result: `B, C, A`, exact action `0 -> 2`, original grouping cell id
  and value preserved.
- Unknown source group: no callback, order and grouping cell unchanged.
- `@notion-kit/table-hook`: 8 files, 159 tests passed.
- Focused grouped table/list E2E: 2 passed.
- Full drag-and-drop and layouts/RowView specs: 12 passed.
- Table-hook typecheck, lint, format, and diff check passed.
