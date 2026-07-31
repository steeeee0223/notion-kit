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
