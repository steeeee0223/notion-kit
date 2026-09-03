# Table-view sticky layout refactor

## Goal

Replace table-view's hand-tuned inline offsets with a structural, shared sticky
layout. The rendered layout and all existing row-action interactions remain
unchanged.

## Scope

The refactor covers the table, list, and timeline layouts:

- Table header, ordinary rows, grouped rows, footer, and pinned columns.
- List rows and grouped rows.
- Timeline sidebar rows, header, and pinned title column.
- The outer view controls: `Toolbar`, `ActiveBar`, and `BulkEditBar`.

Board and row-view layouts are outside this change.

## Positioning model

`TableView` owns the shared inline sticky context and exposes named CSS custom
properties for its controls and row-action gutter. Components use logical
inset properties so the model is expressed in start/end terms rather than
physical left/right offsets.

The main toolbar is sticky at inline-end. The active filter/sort bar and bulk
edit bar are sticky at inline-start. This applies through the shared outer
view-controls layer, so the behavior is consistent across every table-view
layout.

Each applicable view body explicitly reserves a row-action gutter. The gutter
is a structural column, not an absolutely positioned overflow area. Row action
groups, the table header selection control, and grouped-row selection use this
space. The content edge immediately after the gutter is the shared start
anchor for pinned columns.

## Layout details

### Table

The header, body rows, grouped rows, and footer use the same action-gutter
width and pinned-content anchor. Header selection occupies the gutter; row
actions occupy it for ordinary rows; grouped rows preserve their selection
control; and the footer carries an empty gutter so pinned footer cells align
with their header and body counterparts.

Pinned columns remain sticky, but their inset is derived from the common
content anchor rather than a local numeric class. Unpinned columns, row order,
cell rendering, selection, and drag behavior are unchanged.

### List

List rows reserve the gutter next to their content. `RowActionGroup` remains
visually outside the row's content surface but participates in the row layout
instead of using a negative inline offset. Grouped list rows use the same
selection alignment as table grouped rows.

### Timeline sidebar

Timeline sidebar rows reserve the same action gutter for sortable row actions.
The sidebar header and title/pinned column align to the resulting content
anchor. The sidebar remains its own scrollable region; this refactor does not
change its width, resize behavior, or timeline-track positioning.

## Testing and verification

- Do not add tests for this CSS-only refactor. Update existing tests only when
  a necessary rendering-tree change invalidates their assumptions.
- Run the existing row-action, selection, drag-and-drop, toolbar, and timeline
  interaction tests.
- Run the table-view package's unit tests, typecheck, and lint after the
  refactor. Perform a visual browser check of horizontally scrolled table and
  timeline sidebar states, including pinned columns.

## Non-goals

- No visual redesign, new controls, interaction changes, or changes to action
  visibility rules.
- No generic `StickyGutter` abstraction or changes to board and row-view
  layouts.
