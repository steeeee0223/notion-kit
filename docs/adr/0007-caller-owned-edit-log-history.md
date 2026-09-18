# Caller-owned edit log history

Table and row history must remain readable after properties change or disappear.
The application also decides whether an edit is accepted and persisted. A
table-hook change proposal alone cannot establish that an edit belongs in history.

`TableView` and `TableViewWrapper` therefore accept optional
`fetchTableEditLogs` and `fetchRowEditLogs` callbacks. The caller owns record
creation, storage, authorization, and historical snapshots. Table-view owns
built-in messages, icons, value rendering, and request state. Log types and
response schemas live in `packages/table-view/src/edit-log/`. History state and
actions stay outside `packages/table-hook/`. Capturing changes inside the viewer
would couple display to persistence and could record edits that a controlled
owner rejects.

The callbacks independently enable their menu entries and can use different
endpoints. A single callback with a scope argument would need a separate way to
declare which histories are available. Opening a menu does not fetch history.
Requests start when the user opens history, loads another page, or retries.

`TableEditLog` stores a semantic action, historical target name, and the
structured result needed for display. Table-view generates built-in messages
and icons from those fields. For example, `lock` displays **Locked database**,
while `change-layout` uses the saved `layout` for the view name and icon.
Property type changes use the historical `property` type. Grouping records
carry a `groupBy` property snapshot so its icon and name survive column changes.
Centralizing these presentation rules keeps wording consistent across callers.
`TableEditLogAction` defines the supported actions. Page validation rejects
unknown actions and missing required snapshots. Callers supply structured
records without display-message fields.

`RowEditLog` stores the property name, icon, type, configuration, resulting
value, and `textValue`. Table history uses the same data in its optional `cell`
snapshot, required for the `update` action. For cell edits, `target.name` stores
the historical row name, and table-view composes the **property · row → value**
entry. Select option labels
and colors, number formats, and date settings belong to the snapshot.
Created-time and last-edited-time values contain resolved historical timestamps.
Looking up current columns would make old records change after a rename or
fail after a property is deleted.

Both histories render cell values through the optional
`TableUiPlugin.renderReadOnlyValue` renderer. It receives the snapshot without
a live cell, table, or mutation callback. Built-in adapters reuse value
components without editors, preserving checkbox, tag, number, and date
presentation in both histories. Reusing `renderCell` would bring live state
and editing behavior into history.

Historical data can outlive a plugin or its supported configuration. Missing
renderers and unsupported values use the saved `textValue`. A per-value error
boundary gives a failing custom renderer the same fallback without closing the
dialog. Built-in adapters validate values and configuration with Zod. Page
schemas validate external records, including the requested row ID, before
adding them to the list. These checks protect real API and plugin boundaries.

Both histories use one-line entries with the timestamp beside the content.
Long content scrolls horizontally, keeping the property name and value together.
Row entries use the historical property icon or the default icon for its type.
Table entries use the same rule for their `cell.property` or `property`
snapshot. Table-level operations, such as creating a property or changing the
layout, omit those snapshots and use an action icon. Built-in messages describe
the operation and its result without expanding into configuration diffs.

Each table wrapper owns one dialog and keeps its request state outside table
resources. Opening history closes the source menu. The dialog blocks background
row shortcuts, including during its close event, and returns focus to the source
control or another control in the same table. This preserves row interactions
when history opens from a popover, context menu, or nested row view.
Source menus use Base UI's default focus restoration so a closing menu respects
focus that has already moved to another control or dialog.

Fetch callbacks return newest-first pages with stable record IDs and an opaque
`nextCursor`. The caller keeps ordering and pagination boundaries stable when
new edits arrive. Manual **Load more** appends records while preserving the
reading position. Scrolling never triggers a request. A failed additional page
keeps visible entries and retries the same cursor. Duplicate IDs keep the first
received snapshot, while a repeated pagination cursor produces an error rather
than an endless sequence of requests.

Closing history, changing its target, removing its callback, or unmounting aborts
the active request and discards the session. The request's abort status also
prevents late results from entering another history if the callback ignores
cancellation. Reopening fetches the first page. Changing a callback reference
alone does not reset an open history; the next request uses the latest callback.
There is no polling or cache shared between sessions. This keeps history reads
explicit without coupling them to renders or table edits.

Storybook and registry demos use static sample history from
`@notion-kit/table-view/mock`. Its separate package entry keeps demo fixtures
out of normal imports. The notion-table example instead uses
`useTableWithEditLogs` to store accepted edits in a single `useState` history.
It copies snapshots when recording them and derives table and row responses
from that history. Property operations and their automatic cell updates share
an action ID, so the example records the property operation once. Property
updates compare the previous and resulting names to distinguish a rename from
a settings change. The presence of a name cannot identify a rename because
configuration updates also contain the full property payload.

The example's `ViewHistory` component subscribes to sorting and grouping atoms
because those changes do not emit view resource actions. It records changed
rules and grouping properties through the same history hook. Default sorting
method initialization does not add a second record for a new rule. Opening a
row is navigation and adds no record. This example loses history on reload and
demonstrates caller ownership without introducing a persistence framework.

These records describe edits but cannot reconstruct or reverse the table.
Undo, restoration, and versioning require a separate data-owner contract for
committed revisions, transaction boundaries, prior values, and concurrent edits.
Aborting a history request only cancels a read. It does not cancel a mutation.

Tests cover the user flows through menus and dialogs, snapshot rendering, and
request races. Focused adapter tests cover formatting that those flows cannot
establish. Browser tests verify scrolling, focus, and background shortcut
isolation. Testing each presentation component separately would duplicate these
checks and make harmless markup changes costly.

The [edit log documentation](../../apps/docs/content/docs/blocks/table-view/index.mdx#edit-logs)
describes the fetch API. The
[read-only renderer documentation](../../apps/docs/content/docs/blocks/table-view/cell-plugins.mdx#read-only-history-renderers)
describes the plugin contract.
