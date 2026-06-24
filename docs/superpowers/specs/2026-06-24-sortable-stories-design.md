# Sortable Stories Design

## Goal

Add three focused Storybook examples for the `Sortable` primitive: two vertical sortable list patterns and a Kanban board modeled on the table view's board styling.

## Scope

Create `apps/storybook/src/stories/ui/sortable.stories.tsx` with three stories:

- `SortableList` demonstrates straightforward vertical reordering with explicit drag handles.
- `SortableSidebarList` demonstrates vertical reordering where each full sidebar-style row is the drag handle.
- `KanbanBoard` demonstrates horizontally sortable columns plus cards that reorder within a column and move between columns, including empty-column drops.

The stories use local fixture data and React state. They do not depend on the table view's row model and do not change the production `Sortable` API or board implementation.

## Component Design

The story module exports Storybook metadata under `Notion UI/Sortable`. Small private components keep the examples readable:

- Both list examples render `Sortable.List` as `MenuGroup` and compose each `Sortable.Item` through its `render` prop with a `MenuItem`.
- The explicit-handle list places `Sortable.Handle` in the rendered menu item's action area.
- The sidebar list omits `Sortable.Handle`, making the full rendered `MenuItem` row the drag surface.
- A board column renders a sortable column shell, header, card list, empty drop area, and add-page affordance.
- A board card renders a compact page-style card and uses `Sortable.Item` metadata to identify its column.

The Kanban layout reuses the dimensions, spacing, muted controls, rounded cards, and border treatment found in `packages/table-view/src/board-view` while remaining a standalone primitive demo.

## State and Drag Flow

Each list story stores an ordered array and accepts the next order from `Sortable.Root.onItemsChange`.

The board stores a column order and a record of card arrays keyed by column ID. One `Sortable.Root` coordinates both item types:

- Column items use a horizontal list and accept only other columns.
- Card items identify their parent column through `group` and drag data, and accept only cards.
- A droppable region per column makes empty columns valid targets.
- During card drag-over, a local move helper derives the next board state for same-column and cross-column moves.
- Drag end preserves the final valid state or restores the pre-drag snapshot when canceled.
- `Sortable.Overlay` renders a lightweight copy of the active card.

Column and card IDs are distinct strings so nested sortable registration cannot collide.

## Accessibility and Interaction

The explicit-handle list and every draggable column use labeled `Sortable.Handle` controls. Both list patterns preserve `MenuItem` roles and labels. The sidebar list deliberately uses each full menu row as its drag surface. Cards use their card body as the sortable surface, matching the production board interaction. Column headings and card labels remain readable without drag interaction.

## Verification

- Add Storybook play assertions for all stories' initial content and accessible drag affordances.
- Run Storybook type checking and linting for the new module.
- Build or run the relevant Storybook test target if the local environment supports it.
- Perform a browser check of both list interactions, column reordering, same-column card ordering, cross-column movement, and empty-column drops.
