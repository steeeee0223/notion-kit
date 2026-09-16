# Change layouts and open rows

Users change the projection of shared row data, choose how a row opens, navigate the current view, and work with dated rows on a timeline.

## Sub-features

- `layout`: Table, List, Board, and Timeline share resources; Calendar/Gallery/Chart are disabled choices. An ungrouped Board asks for a grouping property. [Renderer selection](../../../../packages/table-view/src/table-contexts/table-view-provider.tsx), [layout choices](../../../../packages/table-view/src/menus/layout-menu.tsx), [Board empty state](../../../../packages/table-view/src/board-view/board-view-content.tsx).
- `row-open`: Table hover action, List row, Board card/keyboard, Timeline sidebar title/bar, and row menus open the configured row display. Side and Center peek display shared visible non-title properties. [Title entry](../../../../packages/table-view/src/plugins/title/title-cell.tsx), [Board entry](../../../../packages/table-view/src/board-view/board-card.tsx), [Timeline entries](../../../../packages/table-view/src/timeline-view/timeline-track-row.tsx).
- `row-navigation`: previous/next follow the current rendered row order, excluding group headings; bounds disable navigation. Escape dismisses a peek; Side has Close row. Open detail also offers Switch peek mode and full-page opening, including Meta+Enter. [Navigation and display controls](../../../../packages/table-view/src/row-view/view-nav.tsx).
- `full-page`: a nonempty `getRowUrl` hands off full/new-tab navigation to the consuming app. With no URL, Full page has an inline full-screen fallback. [Hook opening](../../../../packages/table-hook/src/features/menu.ts), [full fallback](../../../../packages/table-view/src/row-view/full-view.tsx).
- `timeline-property`: Timeline by selects a visible, undeleted date property; if none is usable, initialization creates one, seeds row dates from row timestamps, and selects it. Related resource events share an operation ID. [Property selection](../../../../packages/table-view/src/menus/layout-menu.tsx), [initialization](../../../../packages/table-view/src/timeline-view/use-timeline-view-state.ts), [date adaptation](../../../../packages/table-view/src/timeline-view/timeline-adapter.ts).
- `timeline-dates`: Add date on an empty track, move bars, resize start/end, open from bars, and right-click for row actions. Date mutations update the selected property. [Track controls](../../../../packages/table-view/src/timeline-view/timeline-track-row.tsx).
- `timeline-navigation`: Day/Month/Quarter, Previous/Today/Next, Hide table/Show table, sidebar resizing/reordering, and grouped expand/collapse with aligned sidebar/track projections. [Timeline content](../../../../packages/table-view/src/timeline-view/timeline-view-content.tsx), [sidebar](../../../../packages/table-view/src/timeline-view/timeline-sidebar.tsx), [range control](../../../../packages/ui/src/timeline/tools/timeline-range-select.tsx), [date navigation](../../../../packages/ui/src/timeline/tools/timeline-jump-to.tsx).
- `view-lock`: Lock/Unlock database updates the view and clears row selection. Table/List row mutations, property triggers, and Timeline mutation controls have surface-specific restrictions; opening/navigation remain separate operations. [Lock state](../../../../packages/table-hook/src/features/menu.ts), [row-property restrictions](../../../../packages/table-view/src/row-view/view-props.tsx).

## How to get to it (user POV)

- **Settings → Layout** selects the layout and **Open pages in** preference. In ungrouped Board, choose **Select a grouping property**.
- In Table hover a row and use its open button; in List click the row; in Board click a card or press Enter/Space; in Timeline click the sidebar title or dated bar. Row menus provide configured opening too.
- Within detail use Previous row/Next row, Switch peek mode, and Open in full page. Close Side with Close row; dismiss Center with Escape or the dialog's outside-dismiss behavior.
- In Timeline choose **Settings → Layout → Timeline by**. On a blank track use **Add date to <title>**; drag a bar or either resize handle.
- Timeline's own toolbar provides range/date navigation and Hide table/Show table. Group toggles synchronize the sidebar and tracks.
- **Settings → Lock database / Unlock database** changes locking.

## Driving it with Playwright

Preconditions: healthy controlled fixture; Alpha has a Due date. Set the browser clock to `2025-01-01T12:00:00Z` before navigation so the fixture's dated records are near Today. This fixture supplies `getRowUrl`; full-page checks can prove URL handoff, but cannot exercise the inline fallback.

1. Open **Settings → Layout**. Require Table/List/Board/Timeline enabled and Calendar/Gallery/Chart disabled. Choose Timeline and close settings. Choose **Day** in the timeline range control; require `view.timeline.range: "daily"` and enough bar width to click away from resize handles.
2. Locate the **Timeline table** sidebar title with `table.timelineSidebarRow("row-alpha").getByLabel("Alpha", { exact: true })`. Click its unobscured trailing area using coordinates derived from its bounding box, as shown in the skill-owned journey. Require Alpha detail and `openedRowId: "row-alpha"`; close it. Report any overlapping row controls as a product issue; this check does not prove that the whole title area is usable.
3. Click `table.timelineItemCard("row-alpha")`. Require the same detail through the bar entry, then close it. These are distinct user entry points.
4. Use **Hide table**, require the sidebar to disappear, then **Show table** and require it to return without changing row data.
5. Capture actions, view callbacks, resulting UI, and resources. For Timeline by/date changes, create another date property through the property UI, select it, add a missing date, then drag/resize; assert the exact targeted property values, not only bar movement.

When Full page changes, test both consumer configurations: a working destination URL and no URL for the inline fallback. A fixture 404 can prove a URL handoff, but cannot prove the destination page or the fallback.

## Gotchas

- Center peek has no Close row button. Navigation uses current filtered/sorted/grouped order, not a fixed fixture sequence.
- The current Timeline sidebar title is a generic clickable element, not a button. The existing `openPrimaryRow("timeline", ...)` page-object method assumes a button and is stale; reuse its scoped sidebar-row query and click the visible title instead.
- Selecting a layout does not prove its editor, row-opening, drag, or lock paths. Choose the affected entry explicitly.
- Board grouping is a product requirement, surfaced by its grouping-property prompt.
- Timeline initialization can update data, properties, and view together. Verify all affected resources and the shared operation identity.
- Calendar/Gallery/Chart and Week/Year ranges are not implemented choices. Do not infer them from type names or commented options.
- Test lock behavior separately across layouts. Any accessible mutation while locked is a product issue to report, not a supported exception to add to the map.
