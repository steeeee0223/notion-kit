# Layouts and row-view audit

## Responsibility

Protect observable behavior across table, list, board, timeline, and row-view
surfaces: rendering, row opening, creation/deletion, grouping, drag/resize,
navigation, and locked-state behavior.

## Invariants

- Empty and grouped layouts render their correct structural boundaries.
- Row creation, editing, deletion, and opening target the intended resource.
- Board and timeline projections stay aligned with their source rows and dates.
- Timeline initialization repairs only when the owner permits it and never
  mutates source cells merely to render.

## Source and tests

- Table/list/board interactions: [`layout-interactions.test.tsx`](../../src/__tests__/layout-interactions.test.tsx), [`src/board-view/`](../../src/board-view/)
- Timeline behavior: [`src/timeline-view/`](../../src/timeline-view/)
- Row views: [`view-props.test.tsx`](../../src/row-view/view-props.test.tsx)
- Row selection surface: [`table-row-selection.test.tsx`](../../src/table-body/table-row-selection.test.tsx)
- Sorted row drag: [`sorted-row-drag.test.tsx`](../../src/__tests__/sorted-row-drag.test.tsx)

## Update this audit when

Add or update coverage when a layout adds a state, changes projection or
geometry, changes row navigation, or changes locked/empty/grouped behavior.
