# Table View Reactivity M1 Report

## Scope

Milestone 1 focused on `@notion-kit/table-hook` and `@notion-kit/table-view` render reactivity. It did not change the public resource API; `data`, `properties`, `table`, and the existing callbacks keep their current names and behavior for this milestone.

## Investigation Method

The investigation used a static render-dependency inventory plus a temporary React Testing Library profiler-style probe. The probe consumed `TableViewContext` as a custom child and counted commits while sorting changed inside the TanStack store. With the old broad root subscription, the probe rerendered on sorting changes even though it did not render sorting UI. After narrowing the root selector and stabilizing context access, the probe no longer rerenders for that internal store update.

Representative interactions reviewed:

- Column sizing and resizing: table layout, header, body, and footer read sizing state and header builders.
- Sorting and grouping: sort menu, sort selector, row model, list/table/board roots, and grouping menus read sorting/grouping state.
- Group expansion and collapse: row model consumers and grouped-row components read expansion and grouping builders.
- Column ordering, visibility, pinning, and freezing: header, body, footer, props menu, prop menu, and board/list/table rows depend on column order and visibility.
- Opening and changing table menus: toolbar and table-view menu read the menu store slice.
- Switching layouts: the content switch reads `tableGlobal.layout`.
- Opening and closing row views: row-view shells read `tableGlobal.rowView` and `tableGlobal.openedRowId`.
- Editing cells and adding, deleting, or moving rows: row model roots rerender through subscribed coarse table/list/board boundaries; React-owned data replacement cost remains separate.

## Render Dependency Inventory

The main render-time dependencies found were:

- Root access: `TableViewWrapper` provided a fresh `{ table }` facade, broadcasting through context on root rerenders.
- Layout root: `Content` read `table.getTableGlobalState().layout`.
- Table surface: `TableViewContent` read `sorting`, `columnResizing`, `columnSizing`, and flat header builders.
- Body/list/board roots: row model builders depended on sorting, grouping, expansion, column order, visibility, pinning, and properties.
- Header/footer roots: header/footer builders depended on column order, visibility, pinning, sizing, resizing, property info, and column counting.
- Toolbar and menus: table menu, layout, sort, grouping, property, and type menus read menu, table-global, sorting, grouping, and property state.
- Row views: dialog, side, full, nav, and title components read opened-row state, row-view mode, title column, and visible row cells.

## Optimizations Applied

- Narrowed `useTableView` to `useTable(..., () => null)` so the hook no longer subscribes the root to every TanStack store slice.
- Stabilized `TableViewContext` as an access context with a stable value and a getter for the latest table facade.
- Added coarse `table.Subscribe` boundaries for:
  - layout selection in `Content`;
  - toolbar menu state;
  - table layout content;
  - table body, header, and footer;
  - list and board layout roots;
  - table-view, layout, and sort menus;
  - dialog, side, and full row-view shells.

These are coarse boundaries by design. They preserve correctness first and move rerenders below the provider/context boundary. Per-row, per-column, or atom-level selectors should be added only after profiler evidence shows the coarse boundaries still do material unnecessary work.

## Stale-UI Coverage

`packages/table-view/src/table-contexts/table-view-reactivity.test.tsx` covers:

- switching from table to list and board layouts;
- lock state hiding the table add-row affordance;
- sorting state showing and clearing the sort selector;
- internal sorting updates not rebroadcasting context to custom children;
- opening a row view from row actions.

The broadcast test failed before the stable-context/subscription changes and passes after the M1 implementation.

## Follow-Up Profiling Notes

Expected improvement: internal TanStack store changes no longer make the provider context broadcast to arbitrary custom children. Store-driven UI work is now routed through subscribed first-party regions.

Remaining profiling work should use React DevTools Profiler or an equivalent local `<Profiler>` harness over larger representative data. The next measurements should compare:

- column-resize commits in header/body/footer;
- row-model commits for sorting, grouping, and expansion;
- board commits during group drag and row drag;
- menu commits when changing layout, grouping, sorting, and property visibility.

## Remaining Costs

- React-owned resource replacement still rerenders through parent/provider React state or props. `Subscribe` does not prevent those updates.
- Some nested components still read builder methods or `table.store.state` directly, but they are currently rendered under subscribed coarse roots. If profiling shows these roots are still too broad, split them into per-row, per-column, menu-page, or atom subscriptions.
- Cell edit performance was not optimized in M1 beyond preventing unrelated context broadcasts.
