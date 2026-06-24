# Sortable Stories Design

## Goal

Add two focused Storybook examples for the `Sortable` primitive: a vertical sortable list and a Kanban board modeled on the table view's board styling.

## Scope

Create `apps/storybook/src/stories/ui/sortable.stories.tsx` with two stories:

- `SortableList` demonstrates straightforward vertical reordering with explicit drag handles.
- `KanbanBoard` demonstrates horizontally sortable columns plus cards that reorder within a column and move between columns, including empty-column drops.

The stories use local fixture data and React state. They do not depend on the table view's row model and do not change the production `Sortable` API or board implementation.

## Component Design

The story module exports Storybook metadata under `Notion UI/Sortable`. Small private components keep the examples readable:

- A list row renders a label and `Sortable.Handle` inside `Sortable.Item`.
- A board column renders a sortable column shell, header, card list, empty drop area, and add-page affordance.
- A board card renders a compact page-style card and uses `Sortable.Item` metadata to identify its column.

The Kanban layout reuses the dimensions, spacing, muted controls, rounded cards, and border treatment found in `packages/table-view/src/board-view` while remaining a standalone primitive demo.

## State and Drag Flow

The list stores an ordered array and accepts the next order from `Sortable.Root.onItemsChange`.

The board stores a column order and a record of card arrays keyed by column ID. One `Sortable.Root` coordinates both item types:

- Column items use a horizontal list and accept only other columns.
- Card items identify their parent column through `group` and drag data, and accept only cards.
- A droppable region per column makes empty columns valid targets.
- During card drag-over, a local move helper derives the next board state for same-column and cross-column moves.
- Drag end preserves the final valid state or restores the pre-drag snapshot when canceled.
- `Sortable.Overlay` renders a lightweight copy of the active card.

Column and card IDs are distinct strings so nested sortable registration cannot collide.

## Accessibility and Interaction

Every draggable column and list row has an explicitly labeled `Sortable.Handle`. Cards use their card body as the sortable surface, matching the production board interaction. Column headings and card labels remain readable without drag interaction.

## Verification

- Add Storybook play assertions for both stories' initial content and accessible handles.
- Run Storybook type checking and linting for the new module.
- Build or run the relevant Storybook test target if the local environment supports it.
- Perform a browser check of list reordering, column reordering, same-column card ordering, cross-column movement, and empty-column drops.
