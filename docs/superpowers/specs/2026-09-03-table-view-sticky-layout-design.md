# Table-view sticky layout correction

## Goal

Correct the regressions introduced by the structural sticky-gutter refactor:
table headers and row cells must share an inline origin, row borders must
remain continuous through horizontal scrolling, and timeline sidebar titles
must align with their header.

## Scope

The correction covers table and timeline layouts only:

- Table header, ordinary rows, the trailing row surface, and pinned columns.
- Timeline sidebar rows, header, and pinned title column.

List, board, row-view, toolbar, active-bar, and bulk-edit layouts are outside
this change.

## Positioning model

Row actions are an overlay lane adjacent to the data grid, rather than a
structural data column. The table header, data cells, and footer use the same
data-grid inline origin. Pinned data columns derive their sticky inset from
that origin only; they never include row-action width.

## Layout details

### Table

The header, data rows, and pinned columns begin on the identical inline edge.
The action group remains outside the data-grid width and does not create a
header/body offset. Ordinary rows own their bottom border. The action overlay
has no independent bottom border at rest; when it is sticky over a row, the
row's own bottom rule remains visible beneath it. A trailing row surface
extends that rule through the horizontal end of the table, including after the
last visible column.

Pinning must retain the same overlay model: a pinned title column and its
header align at the data-grid edge while actions remain in the adjacent lane.
Unpinned rendering, row order, cell rendering, selection, and drag behavior
are unchanged.

### Timeline sidebar

Timeline sidebar header and row title cells use one shared title-cell origin.
Sortable row actions occupy the adjacent overlay lane without pushing a row
title farther right than its header. The sidebar remains its own scrollable
region; this correction does not change its width, resize behavior, track
positioning, or row-to-track vertical alignment.

## Testing and verification

- Do not add test-first coverage. Update existing tests only when a necessary
  rendering-tree change invalidates their assumptions, per the user's request.
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
