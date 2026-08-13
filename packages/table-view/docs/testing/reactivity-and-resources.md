# Reactivity, resources, and interaction audit

## Responsibility

Protect the bridge between table-hook resources and rendered table-view state:
controlled updates, context broadcasts, drag/resize settlement, toolbar state,
and cross-surface refresh behavior.

## Invariants

- Accepted resource updates reach every dependent surface exactly once.
- Controlled-owner rejection or replacement is reflected before the next user
  gesture.
- Drag, resize, keyboard, and pointer-cancel paths do not leak stale state.
- Toolbar and header actions emit complete, serializable resource changes.

## Source and tests

- Context and resource reactivity: [`table-view-reactivity.test.tsx`](../../src/table-contexts/table-view-reactivity.test.tsx)
- Header drag/resize: [`table-header-cell.test.tsx`](../../src/table-header/table-header-cell.test.tsx), [`table-header-row.test.ts`](../../src/table-header/table-header-row.test.ts)
- Board DnD: [`use-board-dnd.test.tsx`](../../src/board-view/use-board-dnd.test.tsx)
- Timeline DnD: [`timeline-dnd-interactions.test.tsx`](../../src/timeline-view/timeline-dnd-interactions.test.tsx)
- Toolbar: [`toolbar.test.tsx`](../../src/tools/toolbar.test.tsx)
- Common triggers/actions: [`src/common/`](../../src/common/)

## Update this audit when

Add or update coverage when a resource callback, controlled settlement path,
deferred gesture, context subscription, or cross-layout interaction changes.
