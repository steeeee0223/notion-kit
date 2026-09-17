# Table-view edit log design

Status: approved on 2026-09-17, with `packages/table-hook/` explicitly protected
from changes. Implementation planning is recorded in
[tasks/plan.md](../../../tasks/plan.md) and [tasks/todo.md](../../../tasks/todo.md).

## Purpose and scope

Table-view exposes two optional ways to inspect externally stored edit logs:

- **Table menu → Edit log** opens table-level history. Each entry describes a
  property or view operation, such as creating, updating, deleting, hiding,
  duplicating, or configuring a property, or changing the layout.
- **Row action menu → Edit log** opens the selected row's cell history. Each
  entry displays the value after the edit with the cell type's read-only style.

The caller supplies the fetch functions and owns log creation, storage, access
control, and historical snapshots. Table-view does not capture edits, compare
table resources, subscribe to mutation callbacks, or generate log entries.

This feature includes a shared dialog, manual pagination, mock APIs, demo
integration, and documentation. It excludes versioning, undo and redo, operation
cancellation, restoring edits, editing logs, before-and-after comparisons, full
configuration diffs, search, and filtering. No files in `packages/table-hook`
change, including its types, exports, build configuration, and mock fixtures.

## Existing boundaries

`packages/table-hook` owns table data types and exports fixtures through
`@notion-kit/table-hook/mock`. Its resource actions describe editing proposals,
but this feature does not consume those actions or change their behavior. Demos
can continue importing its existing fixtures without extending that package.

`packages/table-view` owns the menus, UI plugin registry, and value components.
Existing value components include `SelectCellValue`, `CheckboxCellValue`,
`NumberCellValue`, `TextCellValue`, and `DatePickerCellValue`. The normal
`renderCell` path also connects live table state and editing controls, so the
log viewer needs a separate read-only entry point into these value components.

The implementation reuses the repository's Dialog, Button, scrolling primitives,
and `@notion-kit/icons`.

## History viewing and operation history

Display history and reversible operations have different contracts. These log
records contain summaries and the snapshots needed for presentation. They are
not a complete, ordered record from which the table can be reconstructed or an
operation safely reversed.

Versioning or undo would need authoritative commit results, revision identifiers,
transaction boundaries, sufficient prior data, and a policy for concurrent edits.
For example, restoring a deleted property may require its definition and all of
its former cell values. A table-hook proposal alone does not establish that a
controlled data owner accepted or persisted the change.

Those capabilities belong in a separately designed history layer at the data
owner, with backend support where persistence is involved. Any later table-hook
integration must follow that contract. This viewer can consume display records
from such a layer without implementing one now.

Canceling a log fetch through `AbortSignal` only stops or discards that read.
It does not cancel a pending mutation or undo a committed operation. Those
operations require a separate data-owner contract.

## Fetch API

`TableView` and `TableViewWrapper` accept two optional props:

| Prop | Input | Result |
| --- | --- | --- |
| `fetchTableEditLogs` | `{ cursor?, signal }` | `Promise<EditLogPage<TableEditLog>>` |
| `fetchRowEditLogs` | `{ rowId, cursor?, signal }` | `Promise<EditLogPage<RowEditLog>>` |

`cursor` is an opaque string and is omitted for the first page. `signal` is an
`AbortSignal` supplied by the dialog. The caller captures its table identifier
and any endpoint settings in the function. The function also adapts the backend
response to the public log types.

`EditLogPage<T>` contains `items: T[]` and `nextCursor: string | null`.
`nextCursor: null` marks the end. The API decides the page size. Records arrive
newest first, with stable ordering for equal timestamps. Pagination must keep
its boundary stable when newer records are added.

Each function independently enables its corresponding menu item. A missing
function hides that item. Locked tables can still show supplied log history
where their menus are accessible. Fetch functions are never invoked merely
because a menu opens, the table mounts, or table data changes.

Two callbacks allow table and row history to use different endpoints and to be
enabled independently. A single scope-based callback was considered, but it
would also need a way to declare which entry points are available.

## Log records and snapshots

All records contain a stable `id` and an `editedAt` timestamp in Unix
milliseconds. IDs are unique within the requested history, including across
pages. The caller returns immutable historical content.

### Table records

`TableEditLog` contains these additional fields:

| Field | Meaning |
| --- | --- |
| `action: string` | Semantic operation used to select an action icon. |
| `target: { id?: string; name: string }` | Historical property or view-setting label. |
| `summary: string` | Plain-text action and result, ready for display. |

The caller supplies the summary, including any localization. The component
does not derive summaries from the live table or require complete config
payloads for table entries. For example, a deleted property remains readable
through its stored target name and summary.

The built-in action names and icons are:

| Action | Icon |
| --- | --- |
| `create` | Plus |
| `duplicate` | Duplicate |
| `delete` | Trash |
| `restore` | Undo |
| `hide` | EyeHide |
| `show` | Eye |
| `move` | ArrowUpDown |
| `resize` | ArrowLeftRight |
| `update`, `update-config`, `change-type`, `change-layout` | Sliders |
| Any other action | Clock |

These are display identifiers, not new table mutation actions. Unknown action
names remain visible with the fallback icon and the supplied summary.

### Row records

`RowEditLog` contains these additional fields:

| Field | Meaning |
| --- | --- |
| `rowId: string` | The row whose cell changed. |
| `property` | Snapshot containing `id`, `name`, `icon`, `type`, and `config`. |
| `value: unknown` | The cell value after the edit. |
| `textValue: string` | Historical plain-text representation for fallback and accessibility. |

`property.icon` is optional `IconData` or null. Its absence uses the historical
type's default icon. `property.config` can be omitted for types without config;
types with config must include the historical settings needed to display the
value. Select snapshots include the option names and colors needed by the
record. Date and number snapshots include their historical formatting settings.

The viewer never resolves a record's property through current columns. Renaming,
reconfiguring, changing the type, or deleting a property cannot change an older
record. The same applies to deleted or renamed select options.

Editable built-in types use their existing cell data shapes. If a caller supplies
created-time or last-edited-time records, `value` contains the resolved historical
Unix timestamp in milliseconds. These adapters must not read current row times.

## Dialog and item presentation

Both entry points open the same centered **Edit log** dialog. The row variant
captures the selected row's title when opening, falling back to its row ID.
This heading is separate from the historical labels inside the log entries.

The dialog has a close control and a bounded, vertically scrollable list.
Each item follows one of these layouts:

- Table: `<edited-time> <action-icon> <target.name> → <summary>`.
- Row: `<edited-time> <property.icon> <property.name> → <read-only value>`.

Table entries always use action icons and text summaries. They never expand
into full configuration diffs. Row entries preserve the normal visual forms
of select tags, checkboxes, dates, numbers, and text, without editing controls.

Timestamps use the viewer's locale and time zone, with both date and time.
Each timestamp uses a semantic `time` element. Long names, summaries, and values
wrap within the dialog instead of requiring horizontal scrolling. Empty cell
values display **Empty**; false checkboxes and numeric zero remain visible values.

**Load more** sits after the entries inside the scrolling area. It appears only
when `nextCursor` is not null. Reaching the bottom does not start a request.
Clicking the button appends the next page and preserves the scroll position.

The dialog traps focus and supports Escape. Opening it closes the originating
menu. Closing it restores focus to the table settings or row actions trigger
when that element still exists, otherwise to an appropriate table control.
Loading and error messages are accessible, and action icons are decorative
because summaries convey their meaning.

## Request lifecycle

The dialog owns its request state separately from table resources:

1. Opening a history clears the previous session and fetches its first page.
2. During the first request, the dialog displays a loading state. An empty
   successful response displays **No edit logs yet**.
3. Clicking **Load more** starts one request for the current cursor. The button
   is disabled while that request runs. Existing entries remain visible.
4. Successful pages append entries in API order. Overlapping IDs are ignored,
   preserving the first received snapshot and position.
5. A first-page failure displays **Retry**. A later-page failure preserves the
   entries and provides a retry for the same cursor at the bottom.
6. Closing the dialog, changing its target, removing its fetch function, or
   unmounting cancels the active request and discards the session.

Request identity checks also ignore late results if a callback ignores its
abort signal. Opening another row cannot display the previous row's result.
Reopening starts at the first page; there is no automatic refresh, polling,
prefetching, or cross-session cache. A callback identity change alone does not
restart an open session. Subsequent user requests use the latest callback.

An empty page can still expose **Load more** when it has a new cursor. A cursor
that repeats an already requested pagination boundary is a response error,
preventing a non-advancing pagination loop.

## Component and type ownership

Log records, page types, and callback types live in
`packages/table-view/src/edit-log/types.ts` and are exported from the table-view
package root. They can reference existing table-hook types without adding a
dependency from table-hook to the viewer. The table-view mock entry point uses
the same local types. `useTableView` does not own log state or fetch functions.

`TableViewWrapper` consumes the fetch props before forwarding table options to
`useTableView`. An edit-log provider exposes stable capability and open actions
to the two menus. A separate controller owns the active target, fetched pages,
and dialog state so that pagination does not update the table context or rerender
the table body. The wrapper hosts at most one dialog for its table, including
when callers compose their own children.

The proposed `packages/table-view/src/edit-log/` module contains the provider,
request hook, dialog, item rendering, action icon mapping, and response schemas.
The provider exposes no edit actions. The dialog and its request state are
mounted for an open history, with no eager history work in the normal cell path.

`TableUiPlugin` gains an optional `renderReadOnlyValue` renderer that receives
historical data, config, property metadata, and `textValue`. It has no live
cell instance, table instance, or mutation callbacks. Built-in adapters reuse
their existing value components, narrowing shared value props where needed.
They do not construct fake rows, register cell selection, or mount editors.

Existing custom plugins remain compatible because the new renderer is optional.
A missing renderer, unknown historical type, or unsupported historical value
uses `textValue`. Each read-only renderer handles its type's empty values.
Custom renderers validate their data and config and remain read-only.

## Validation and failure isolation

API responses pass through Zod schemas before reaching the list. The schemas
validate the page envelope, record fields, timestamps, icons, and requested row
identity. A structurally invalid page follows the normal request error flow.
Existing entries are retained if an additional page is rejected.

Built-in value adapters validate their historical data and config with Zod
before rendering. An invalid value falls back to `textValue` for that entry.
Unknown plugin types use a generic property icon if no historical icon exists.
A per-entry rendering boundary prevents a failing custom renderer from closing
the history dialog or affecting the table. It also falls back to `textValue`.
No log content is rendered as raw HTML.

## Mock API and demo integration

A new `packages/table-view/src/mock.ts` exports a `createMockEditLogApi` factory
through `@notion-kit/table-view/mock`. The table-view package adds the matching
export and build entry. Keeping this separate from the package root prevents
normal table-view imports from pulling in the demo factory.

The factory accepts fixture `data` and `properties`, plus an optional `pageSize`
that defaults to 10. It returns stable `fetchTableEditLogs` and
`fetchRowEditLogs` functions with the production shapes. Existing table-hook
fixtures remain unchanged and can be passed into this factory by demos.

The factory prepares deterministic sample history once from copied fixture
data. Requests return fresh copies, use opaque cursors, honor cancellation, and
never subscribe to subsequent table changes. These records are illustrative
demo history, not captured edits. Unknown row IDs return an empty page.

Sample histories cover create, update, duplicate, delete, hide, layout, and
column-config summaries. Full-fixture row history includes the available cell
types and snapshots that remain meaningful after properties or select options
change. At the default page size, both table history and seeded row histories
contain more than one page. The implementation must document the demo history
as static.

The controlled and uncontrolled registry demos connect these callbacks. The
Storybook database and controlled, list, board, and timeline stories share mock
APIs derived from their fixtures. The calendar registry demo connects a mock API
created once from its initial fixture. New rows added while using a demo have
no seeded history.

The table-view documentation describes the two callbacks, snapshot payloads,
pagination, optional read-only plugin renderer, and static mock behavior.

## Verification

Tests focus on observable behavior:

- Without callbacks, both entries are absent. Supplying just one callback
  enables only its corresponding entry. Mounting, opening menus, and editing
  cells do not fetch or record history.
- Each menu opens the correct dialog and request. Row IDs remain isolated,
  including when requests resolve after closing or switching rows.
- Loading, empty, first-page error, retry, and additional-page error states work.
  Load more is manual, suppresses duplicate requests, appends entries, retains
  existing content, and disappears at the end.
- Duplicate record IDs do not create duplicate entries. Invalid responses and
  non-advancing cursors fail without losing previously loaded entries.
- Table entries use the correct action icons and summaries. Row entries display
  read-only values using historical config after live properties change or
  disappear. Unknown types and invalid values fall back to text.
- Clicking or using the keyboard on log values cannot update cells or configs.
  Closing the dialog restores focus. A custom renderer failure remains local.
- Mock APIs return deterministic isolated snapshots, filter by row ID, paginate,
  honor cancellation, and leave the input fixture unchanged.

React Testing Library tests use the repository's component objects. A focused
browser check opens both histories in a demo, scrolls to **Load more**, loads
another page, and closes the dialog with keyboard focus restored. Relevant
package tests, type checks, lint, and formatting follow the repository's Node
and pnpm instructions. A build verifies the exported types and mock entry point.

The spec changes no runtime code. The implementation plan follows spec approval.
