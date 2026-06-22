# dnd-kit Migration And Sortable Primitives Design

## Goal

Migrate the entire monorepo from the legacy dnd-kit React API to the current
dnd-kit API, introduce reusable sortable-list primitives in `@notion-kit/ui`,
and rebuild table-view's board drag-and-drop flow around the official multiple
sortable lists pattern.

The migration must preserve the behavior of ordinary sortable lists and
free-form timeline dragging while improving consistency, cancellation safety,
empty-group handling, keyboard access, and testability.

## Current State

The workspace catalog currently pins the legacy package family:

- `@dnd-kit/core@^6.3.1`
- `@dnd-kit/modifiers@^9.0.0`
- `@dnd-kit/sortable@^10.0.0`

Production consumers exist in `packages/ui` and `packages/table-view`.
Storybook also contains sortable and free-form drag examples, and `apps/e2e`
declares legacy packages that it does not import directly.

`packages/table-view/src/common/dnd.tsx` provides a local `SortableDnd`
wrapper and a `useDndSensors` hook. It still exposes legacy dnd-kit event and
sensor types, while individual items repeat `useSortable`, transform, opacity,
transition, cursor, and handle wiring. Similar implementations exist outside
table-view, particularly the workspace list and Storybook examples.

Board-view has two sortable levels: horizontal groups and vertical cards that
can move between groups. It currently uses a global custom collision strategy,
combined sortable and droppable refs, placeholder droppables, and legacy event
objects. Cross-group hover does not maintain a clear controlled snapshot that
can be restored when a drag is canceled.

## Dependency Migration

As of 2026-06-22, the current dnd-kit package suite is `0.5.0`. The workspace
catalog will replace the legacy packages with the current packages needed by
direct imports:

- `@dnd-kit/react` for `DragDropProvider`, `DragOverlay`, React hooks, and
  sortable hooks from `@dnd-kit/react/sortable`
- `@dnd-kit/helpers` for `move`
- `@dnd-kit/dom` for DOM sensors and element-boundary modifiers
- `@dnd-kit/abstract` for shared types, collision priorities, and axis
  modifiers

All dnd-kit packages will use the same catalog version range. A workspace will
declare only packages it imports directly. `apps/e2e` will remove its unused
legacy declarations rather than replacing them with unused new declarations.

The migration removes all imports of:

- `@dnd-kit/core`
- `@dnd-kit/modifiers`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

Package bundler external patterns can continue to match `@dnd-kit/*` where
the package's published output intentionally keeps those dependencies external.

## Architecture

The solution has three layers:

1. The current dnd-kit package API is the low-level integration layer.
2. `@notion-kit/ui` owns opinionated sortable-list primitives used by ordinary
   single-list sorting throughout the monorepo.
3. Specialized consumers compose those primitives with direct dnd-kit APIs
   when they need multi-list or free-form behavior.

This boundary deliberately does not hide all drag-and-drop behind one generic
abstraction. Timeline movement and resizing are not sortable-list interactions
and will use `@dnd-kit/react` directly. Board-view shares the sortable item,
handle, and visual conventions, but owns its provider and state orchestration.

## Sortable Primitive API

Add `packages/ui/src/primitives/sortable.tsx` and export it from the primitives
barrel. The file exports the individual components and a `Sortable` object that
exposes `Sortable.Root`, `Sortable.List`, `Sortable.Item`, `Sortable.Handle`,
and `Sortable.Overlay`. The namespace-style family is the canonical consumer
API.

### `Sortable.Root`

`Sortable.Root` wraps `DragDropProvider` for a single controlled list. It
accepts:

- the ordered item IDs
- an orientation of `vertical` or `horizontal`
- a disabled state
- an ordered-ID change callback
- optional drag lifecycle callbacks for consumers that need additional work
- optional sensor and modifier overrides

On a successful sortable drop, the root uses `move` to calculate the next ID
order and emits it once. A canceled operation, missing target, same-position
drop, or stale source/target is a no-op. Consumers that need full control can
disable the automatic order callback and handle the provider event directly.

The root owns a small React context containing orientation, disabled state,
shared sortable type/group defaults, and any default modifiers. This context
provides defaults but is optional for `Sortable.List`, `Sortable.Item`, and
`Sortable.Overlay`; those parts also accept explicit configuration when they
are composed beneath a custom provider such as board-view. It does not recreate
the removed legacy `SortableContext` or coordinate sortable registration.

### `Sortable.List`

`Sortable.List` renders the list container. It reads orientation from the root
or requires an explicit orientation when used without one. Its defaults are:

- a vertical flex column for vertical orientation
- a horizontal flex row for horizontal orientation
- relative positioning suitable for transformed children

It accepts `render`, `className`, and normal element props so consumers can
retain table, menu, grid, sticky, and spacing requirements. It does not own or
duplicate item state.

### `Sortable.Item`

`Sortable.Item` requires `id` and `index`, then registers the current
`useSortable` hook. It accepts `type`, `accept`, `group`, `disabled`,
orientation, collision, modifier, transition, data, and ref-related options
supported by dnd-kit. Explicit props override root defaults, allowing the item
to work under board-view's custom provider.

The default rendered element receives shared behavior and styling:

- drag/drop refs
- grab and grabbing cursor states
- touch-action behavior appropriate for sortable interactions
- dragging opacity and stacking order
- transition and feedback state data attributes
- orientation-aware axis restriction inherited from the root

The item exposes `render` and `className` escape hatches through the same
`useRender` composition pattern used by other UI primitives. Consumers can
therefore keep specialized elements without duplicating dnd-kit wiring.

### `Sortable.Handle`

`Sortable.Handle` connects to the sortable item's handle ref. It renders an
accessible focusable drag handle by default, uses standard grab/grabbing
styles, and accepts a custom accessible label, `render`, and `className`.

When a handle is present, dragging starts from the handle rather than the whole
item. Item content remains clickable and interactive. A handle rendered outside
an item fails fast in development with a clear primitive-context error.

### `Sortable.Overlay`

`Sortable.Overlay` wraps the current `DragOverlay` API with shared visual
feedback. It is optional and is rendered at most once under a provider. Overlay
content is presentational; sortable hooks are never invoked inside it.

## Ordinary Sortable Consumer Migration

All applicable single-list consumers will adopt the new primitive, including:

- table rows and list-view rows
- table columns
- sort rules
- grouping rules and group menus
- select options and select configuration options
- the workspace list
- ordinary sortable Storybook examples

Each consumer supplies stable IDs and explicit indexes. Reordering callbacks
receive the next ordered IDs rather than legacy `DragEndEvent` objects. Every
ordinary single-list table-view feature API will accept ordered IDs; legacy
dnd-kit event types will not remain in table model interfaces or their unit
tests.

Existing consumer markup and layout are preserved through `render` and
`className`. The primitive centralizes only the visual states that are actually
shared: cursor, opacity, stacking, transition, ref/handle wiring, and default
axis behavior.

## Board-View Multiple Lists

Board-view will follow the official dnd-kit multiple sortable lists model with
a controlled mapping shaped as `Record<GroupId, CardId[]>` and a separate
ordered group ID array.

### Registration

Groups register as sortable elements with:

- `type: "board-group"`
- `accept: "board-group"`
- a shared group identifier for the horizontal group list
- an explicit index from the group order

Cards register as sortable elements with:

- `type: "board-card"`
- `accept: "board-card"`
- `group` equal to the containing board group ID
- an explicit index within that group's card array

Each group also registers a droppable card target with
`CollisionPriority.Low`. Card targets therefore win when present, while the
group remains a valid target when it is empty. This replaces placeholder-only
drop behavior and the global legacy collision algorithm.

### Drag Lifecycle

At drag start, board-view snapshots the current card mapping. Card rendering
uses the controlled board mapping during the active operation.
When no drag is active, external table changes replace the controlled mapping
so the board cannot retain stale temporary order.

During card `onDragOver`, board-view applies `move(items, event)` to the
temporary mapping. This provides immediate ordering feedback within and across
groups, including empty groups, using the same state model as the official
guide.

At drag end:

- a canceled card operation restores the snapshot
- a successful card operation commits the final order and group assignment to
  table data once
- a successful group operation commits the final group order
- missing or stale source/target IDs cause no mutation

The commit updates both physical row ordering and the grouping property's cell
value when a card changes groups. Table data is not repeatedly persisted on
every hover; the temporary mapping is the controlled interaction state, and
the completed mapping is committed once.

Only one overlay is mounted for the board provider. It renders a presentational
card clone for card drags. Group dragging continues to use transformed source
feedback and does not add a group overlay.

## Free-Form Drag Migration

Timeline item movement and item resizing migrate from `DndContext` and
`useDraggable` to `DragDropProvider` and the current `useDraggable` API. The
horizontal restriction moves to current per-draggable modifiers. Existing
10-pixel mouse movement activation and date calculations remain unchanged.

Non-sortable Storybook examples migrate similarly. They use current droppable
state names such as `isDropTarget`, current refs, provider events, and current
modifiers without routing through the sortable primitive.

## Sensors And Accessibility

The new API's built-in pointer and keyboard sensors replace the duplicated
legacy pointer, mouse, touch, and keyboard sensor setup.

For ordinary sorting, mouse and pen input retain a small movement threshold so
clicking an item does not accidentally start a drag. Touch uses a delay and
tolerance appropriate to scrolling. Timeline interactions retain their larger
movement threshold. Sensor customization uses `PointerSensor.configure` and
the provider's `sensors` callback only where defaults do not preserve current
behavior.

Keyboard dragging remains enabled. Sortable handles are focusable and have an
accessible name. Consumers can override the label when the item identity needs
to be announced. Locked or disabled lists disable both drag-source and
drop-target behavior consistently.

## Error Handling And State Safety

- A completed operation without a valid target is a no-op.
- A drop onto the current position does not emit an order change.
- Canceled operations never emit committed order changes.
- Board cancellation restores the pre-drag card snapshot.
- Reorder helpers validate IDs before moving them and never pass `-1` indexes
  to an array helper.
- If external data removes the source or target during a drag, the completion
  is ignored and the view reconciles with current external state.
- A handle rendered without a containing sortable item reports the missing
  item context in development.
- Only one overlay is allowed per provider, and its content remains free of
  sortable hooks.

## Testing

### Primitive Tests

Add focused tests for:

- default vertical and horizontal list layout
- custom `render` and `className` composition
- required item IDs and indexes
- disabled root and item behavior
- handle registration and accessible naming
- successful reorder callback semantics
- same-position, missing-target, and canceled no-ops
- shared drag/drop state attributes and classes

Prefer tests of semantic callbacks and rendered wiring over brittle simulated
pointer coordinates.

### Board State Tests

Extract pure board mapping and commit helpers, then cover:

- same-group card reorder
- cross-group card move
- move into an empty group
- horizontal group reorder
- canceled card rollback
- missing source or target
- card group-value update on commit
- preservation of all cards with no duplicates after each transition

### Table Feature Tests

Replace fabricated legacy drag events with ordered IDs.
Keep the existing row, column, group, sorting, and select-option reorder
coverage. Enable the currently skipped grouped-row reorder test once its API no
longer depends on a fabricated legacy event.

### Consumer And Browser Verification

Existing component and import tests must prove that migrated menus, table/list
views, board-view, workspace list, timeline, and Storybook examples render
without legacy packages.

Browser verification covers:

- mouse sorting and click-versus-drag activation
- keyboard sorting
- dedicated drag handles
- board reordering within a group
- board movement across populated and empty groups
- Escape cancellation and snapshot restoration
- horizontal group reordering
- locked/disabled behavior
- overlay appearance and cleanup
- timeline item movement and resizing

### Quality Gates

Before completion:

1. Search the monorepo and confirm no legacy dnd-kit imports or package
   declarations remain.
2. Run workspace dependency consistency checks.
3. Run formatting, linting, typechecking, and unit tests for all affected
   packages and apps.
4. Build affected published packages, Storybook, and the e2e application.
5. Perform the browser verification scenarios above.

## Scope

In scope:

- migrate every dnd-kit dependency and source usage in the monorepo
- add and export the sortable primitive family
- adopt the primitive in every applicable ordinary sortable consumer
- migrate board-view to the official multiple sortable lists state model
- migrate free-form drag consumers directly to the current API
- update tests, stories, table feature contracts, and build configuration as
  required by the new APIs

Out of scope:

- visual redesigns unrelated to shared drag feedback
- changing table sorting, grouping, or persistence semantics beyond what the
  migration requires
- creating a universal abstraction for non-sortable drag-and-drop
- adding new drag-and-drop product features
- refactoring unrelated table-view or UI code

## Success Criteria

The migration is complete when the monorepo contains no legacy dnd-kit package
usage, every ordinary sortable list uses the shared primitive, board cards and
groups behave correctly across all documented edge cases, timeline and demo
dragging retain their behavior, keyboard and pointer interactions work, and all
required tests and builds pass.
