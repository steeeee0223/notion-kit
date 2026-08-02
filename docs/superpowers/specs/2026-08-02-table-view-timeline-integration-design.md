# Table View Timeline Integration

## Problem

`origin/feat/timeline-view` contains a partial Timeline layout integration for
the pre-1.0 table-view architecture. The current repository has since moved
table state into `@notion-kit/table-hook`, adopted the TanStack Table v9 feature
API, migrated menus to Base UI primitives, and introduced controlled and
uncontrolled resource contracts with explicit actions. The old commit therefore
cannot be cherry-picked safely.

The Timeline primitives themselves have already moved from the former
`@notion-kit/timeline` package to `@notion-kit/ui/timeline` and have current unit
coverage. This work integrates those primitives with the current table-view
architecture without duplicating their date-to-pixel or drag behavior.

## Goals

- Enable `layout: "timeline"` in Table View and its Layout menu.
- Persist the Timeline range and selected Date property through the existing
  controlled/uncontrolled view resource.
- Automatically create and seed a Date property when no usable Date property
  exists.
- Support flat and grouped row models, including expansion and collapse.
- Support opening rows, editing ranges, adding missing dates, sidebar resizing,
  and locked views.
- Preserve the current resource action boundary for every data, property, and
  view mutation.
- Add focused unit, integration, and browser coverage without repeating the
  existing Timeline primitive tests.

## Non-goals

- Porting the old TanStack `TimelineFeature` as-is.
- Persisting the temporary sidebar open/closed state.
- Adding calendar, gallery, or chart layouts.
- Changing the Timeline primitive's range algorithms, timezone semantics, or
  column virtualization.
- Adding marker, dependency, milestone, or multi-date-property overlays.
- General refactors of table, list, board, or grouping behavior unrelated to
  Timeline.

## Integration Strategy

Use a view-resource adapter rather than a TanStack Timeline feature.

`@notion-kit/table-hook` owns the generic Timeline view configuration and view
actions. `@notion-kit/table-view` owns all Date-plugin-aware behavior: choosing
a property, converting rows to Timeline items, initializing dates, and writing
range changes back to cells. `@notion-kit/ui/timeline` remains responsible for
visual layout, coordinate conversion, range rendering, and horizontal drag and
resize interactions.

This boundary avoids coupling the generic table hook to Date cell data or UI
components while keeping Timeline configuration compatible with controlled
resources.

## View State and Actions

Add an optional Timeline configuration to the public view state:

```ts
interface TimelineViewState {
  range: "daily" | "monthly" | "quarterly";
  datePropertyId: string | null;
}

interface TableViewState {
  locked?: boolean;
  layout: LayoutType;
  rowView: RowViewType;
  openedRowId: string | null;
  timeline?: TimelineViewState;
}
```

Keeping the property optional avoids breaking existing callers that construct a
complete `TableViewState`. The `useTableView` boundary normalizes an omitted
Timeline configuration to:

```ts
const defaultTimeline = {
  range: "monthly",
  datePropertyId: null,
} satisfies TimelineViewState;
```

The normalized Timeline configuration participates in both controlled and
uncontrolled view state. Add two explicit view actions:

- `view.timeline_range.change`, containing previous and next ranges.
- `view.timeline_property.change`, containing previous and next property IDs.

Sidebar visibility is component-local state, defaults to visible on every
mount, and does not emit a view action.

## Date Property Resolution

A usable Timeline property is visible, not deleted, and has plugin type
`date`. Resolution follows this order:

1. Reuse the persisted `datePropertyId` when it is still usable.
2. Otherwise choose the first usable Date property in property order and
   persist that ID.
3. If none exists and the view is unlocked, create and select a Date property.
4. If none exists and the view is locked, perform no mutation and render a
   read-only empty state.

If the selected property is later hidden, deleted, or converted to another
type, the same resolution runs again. The unlocked view selects the next usable
property or creates one. A locked view does not repair configuration or data.

The Layout menu displays a Date-property radio selector while Timeline is the
current layout. Changing it only changes `datePropertyId`; existing cell values
are neither copied nor overwritten.

## Automatic Property Initialization

The automatically created property uses plugin type `date` and a unique name
derived from `generateUniqueColumnName("Timeline")`. Its normal Date plugin
defaults supply the property config.

Every existing row receives a distinct cell object and cell ID with:

```ts
const initialDate = {
  start: row.createdAt,
  end: Math.max(row.createdAt, row.lastEditedAt),
  endDate: true,
} satisfies DateData;
```

The initialization emits, in order:

1. `properties.create` for the Date property.
2. A bulk `data.cell.update` for seeded rows.
3. `view.timeline_property.change` selecting the new property.

For an empty table, property creation and view selection still occur, but no
empty bulk data change is emitted. Every action emitted by one initialization
shares one operation ID, extending the existing cross-resource
column-operation contract to the view selection emitted by Timeline
initialization.

Initialization is idempotent. A mount-local operation guard prevents React
Strict Mode and a delayed controlled parent from creating the property more
than once. If a controlled parent accepts the property resource but delays or
rejects the data resource, Timeline treats the resulting empty cells according
to the normal empty-cell behavior and does not create another property.

## Row-to-Timeline Adapter

Pure adapter functions in `packages/table-view/src/timeline-view` perform the
Date-plugin-aware work:

- Resolve the selected property from ordered property metadata.
- Convert a leaf row's Date cell into a `TimelineFeature`.
- Return an empty-track result for missing or invalid dates.
- Build initial Date cell values for automatic property creation.
- Convert add, move, and resize callbacks into existing cell resource updates.

A finite `start` is required. A missing `end` is displayed as a one-day item
without mutating the source cell. Equal start and end timestamps are valid.
Non-finite timestamps or `end < start` produce an empty track rather than being
sent into Timeline layout calculations. Timestamp zero is valid and must not be
rejected by truthiness checks.

Adding a date from an empty track creates a one-day range starting at the
clicked calendar day. Moving or resizing a single-date item writes an explicit
range with `endDate: true`. All writes use `table.updateCell`; render code never
mutates row data.

## Component Structure

Add the following Timeline-specific render layer:

- `timeline-view-content.tsx` subscribes to Timeline view configuration, data,
  property, sorting, grouping, and expansion atoms and composes the Timeline
  provider, header, tracks, toolbar, and sidebar.
- `timeline-sidebar.tsx` renders a dedicated title-only header, group rows, and
  leaf rows. It does not reuse the complete multi-column `DndTableBody`.
- `timeline-track-row.tsx` renders a Timeline item, an empty-date affordance, or
  a group spacer for each visible row-model entry.
- Pure adapter and initialization helpers remain independent from React where
  possible.

The main Table View content switch gains an explicit `timeline` branch. The
Layout menu enables its existing Timeline option and conditionally displays the
Date-property selector.

The existing `TimelineAddFeatureHelper` already owns pointer-coordinate to date
conversion. Extend it with an optional row-specific callback, which takes
precedence over the provider callback. The table track passes its row-bound
callback rather than introducing another coordinate implementation.

## Grouped Rendering and Alignment

Use `table.getRowModel().rows` as the single visible projection for both the
sidebar and Timeline tracks. This is the post-sorting, post-grouping,
post-expansion sequence already used by current layouts.

- A grouped row renders the existing group presentation in the sidebar and a
  `44px` spacer track.
- A leaf row renders a title row and one Timeline track using the Timeline
  primitive row height.
- Collapsing a group removes its child sidebar rows and child tracks in the same
  render.
- Hidden groups and sorted rows inherit the current row-model semantics.

Sidebar row reordering follows existing table/list behavior. When sorting is
active, the user must confirm removal of sorting before a reorder commits.
Group ordering continues to be managed by the existing grouping settings and
group APIs; this feature does not add a second group-order mechanism.

## Interaction Rules

- The sidebar is visible by default and may be temporarily collapsed.
- Its title column may be resized through the current column resize API.
- Clicking either a sidebar title or Timeline bar calls
  `table.openRow(row.id)` and respects the configured `rowView`.
- A pointer gesture recognized as drag or resize does not also open the row.
- The Timeline toolbar range selector writes the normalized view resource.
- Empty tracks expose a date-add affordance only when unlocked.
- Unlocked items support horizontal move and resize and write Date cell values.
- Locked items remain visible and can open their row, but do not expose add,
  move, resize, reorder, property repair, or automatic creation mutations.
- Existing Date properties with empty cells retain visible sidebar rows and
  empty tracks. They are not automatically seeded.

## Pending and Failure Behavior

During automatic initialization, render a lightweight pending state until the
selected property is observable. This avoids rendering a partially configured
Timeline between independent controlled resource callbacks. If a controlled
owner does not accept the emitted replacement resources, the pending state
remains visible and no retry is emitted; the component cannot commit or infer
rejection on the owner's behalf.

Missing rows or cells encountered by a delayed callback are treated as no-ops
by the existing table APIs. Invalid Date values render as empty tracks. No
render-time repair or console-error loop is introduced.

## Testing Strategy

Tests follow `TestUnit_Scenario_ExpectedOutcome` naming and keep arrange, act,
and assert focused on one behavior.

### Pure adapter tests

Cover contracts with production failure value:

- Null, missing, hidden, deleted, and wrong-type persisted property IDs.
- First and last available properties and the no-property case.
- Finite zero timestamps, equal boundaries, missing end, non-finite values, and
  reversed boundaries.
- Empty-data initialization and distinct cell object/ID creation for multiple
  rows.
- One-day empty-track creation and exact drag/resize cell payloads.
- Locked resolution producing no mutation plan.

Use table-driven cases for property and timestamp variants.

### UI Timeline primitive tests

The existing tests already cover provider state, viewport preservation, range
headers, add-helper coordinate conversion, drag lifecycle, resize lifecycle,
sidebar controls, and item rendering. Add only one contract test proving that a
row-specific add callback overrides the provider callback. Do not duplicate the
primitive drag algorithm in table-view tests.

### Table View integration tests

Extend existing component objects and verify:

- Timeline layout selection and controlled/uncontrolled view actions.
- Exactly-once automatic initialization under Strict Mode and delayed
  controlled props.
- Partial controlled acceptance does not duplicate property creation.
- Persisted range and Date-property changes compose against pending view state.
- Selected-property deletion or type conversion resolves safely.
- Empty data, all-empty dates, and partially empty dates.
- Sidebar toggle and title/bar row opening.
- Locked and missing-property state emits no properties, data, or view
  mutation.
- Group expansion and collapse keep sidebar and track IDs, order, and counts in
  sync.

Do not assert internal class names when accessible roles, slots, IDs, or
resource envelopes express the user-visible contract.

### Browser tests

Keep three browser-only journeys:

1. `TimelineInitialization_NoDateProperty_CreatesAndSeedsExactlyOneProperty`
2. `TimelineDragResize_ControlledResource_PersistsExactDateCellChanges`
3. `TimelineGrouping_ExpandCollapse_KeepsSidebarAndTracksVerticallyAligned`

The grouping test compares actual sidebar and track bounding boxes because
geometry is the production contract. Range viewport preservation remains in the
existing provider unit test. Locked semantics remain in integration tests
except where the real drag journey needs to prove its disabled boundary.

Update E2E component objects so `TableLayout` includes `"timeline"`, and add
stable Timeline locators based on roles and `data-slot` values.

## Storybook and Documentation

Add Timeline stories for:

- Flat data with an existing Date property.
- Grouped data.
- Locked data.
- Data with no Date property, demonstrating initialization.

Update the Table View documentation to describe the `timeline` layout, its view
state, Date-property selection, automatic initialization, controlled resource
actions, and locked behavior. The standalone Timeline primitive documentation
continues to describe only `@notion-kit/ui/timeline`.

## Migration from the Old Branch

Use `origin/feat/timeline-view` as behavioral reference only.

Reusable concepts include Timeline primitive composition, the first-Date-column
fallback, title sidebar intent, range changes, and Date cell writeback. Rewrite
all integration code that depends on the former `@notion-kit/timeline` package,
TanStack v8 feature extension, `sync` callback, old table context, Radix menu
props, or complete `DndTableBody` reuse.

No merge or cherry-pick of commit `03c98026` is part of the implementation.

## Risks and Mitigations

- **Duplicate automatic creation in controlled mode:** use an idempotent
  operation guard and integration tests with delayed props.
- **Sidebar/track vertical drift:** render both from one visible row projection
  and verify browser geometry for flat, grouped, expanded, and collapsed rows.
- **Cross-resource partial updates:** keep operations idempotent, show pending
  state, and treat accepted empty cells as normal empty tracks.
- **Accidental primitive duplication:** extend the existing add helper and rely
  on existing Timeline drag and provider coverage.
- **View-state compatibility:** keep Timeline state optional at the public
  boundary and normalize it internally.
- **Gesture conflict between opening and dragging:** rely on the Timeline
  primitive activation threshold and test the integrated browser journey.

## Acceptance Criteria

- Consumers can set or switch to `layout: "timeline"` in controlled and
  uncontrolled Table Views.
- Timeline configuration survives parent round-trips through the view resource
  with explicit actions.
- A missing Date property is created once and seeded from creation to last-edit
  timestamps when unlocked.
- Existing empty Date cells remain empty and can be scheduled from their track.
- Flat and grouped sidebars remain aligned with Timeline tracks.
- Row opening, range selection, add, move, resize, reorder, sidebar, and locked
  behavior follow this design.
- Focused package tests, typechecks, builds, and the three browser journeys pass.
