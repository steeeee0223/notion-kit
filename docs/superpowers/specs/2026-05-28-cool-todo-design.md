# Cool Todo List -- Design Spec

A single Storybook story (`interesting/Cool Todo`) that combines a todo list with three "interesting" interaction systems: Eject, SlingShot, and FallingBlocks. Includes a prerequisite refactor of the SlingShot component to support multiple items per root.

## Files

- `apps/storybook/src/stories/blocks/sling-shot.tsx` -- refactored to support multi-item (prerequisite)
- `apps/storybook/src/stories/blocks/sortable.tsx` -- Sortable compound component (DnD wrapper)
- `apps/storybook/src/stories/blocks/cool-todo.tsx` -- component + Zustand store
- `apps/storybook/src/stories/blocks/cool-todo.stories.tsx` -- single story file

## Dependencies

Existing (already in storybook `package.json`):
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`
- `framer-motion`, `react-hotkeys-hook` (used by Eject)
- `@notion-kit/ui/primitives` (Checkbox, Button, DropdownMenu, Popover)
- `@notion-kit/icons` (Icon.DragHandle, Icon.Dots, Icon.Trash, Icon.Undo)
- `@notion-kit/cn`

New:
- `zustand` -- add to `apps/storybook/package.json` dependencies

Internal imports (same `blocks/` directory):
- `Eject`, `EjectRef` from `./eject`
- `SlingShot` from `./sling-shot`
- `FallingBlocks` from `./falling-blocks`

## Data Model (Zustand Store)

```typescript
interface TodoItem {
  id: string;
  label: string;
  status: "active" | "done" | "archived";
}

interface TodoStore {
  todos: TodoItem[];
  addTodo: (label: string) => void;
  checkTodo: (id: string) => void;       // active -> done (eject)
  archiveTodo: (id: string) => void;     // active -> archived (delete menu or slingshot hit)
  restoreTodo: (id: string) => void;     // archived -> active (from trash box)
  deleteTodo: (id: string) => void;      // archived -> removed (delete forever)
  reorderTodos: (activeId: string, overId: string) => void;
}
```

Selectors:
- `useActiveTodos()` -- `todos.filter(t => t.status === "active")`
- `useArchivedTodos()` -- `todos.filter(t => t.status === "archived")`

The store is created inline in the component file via `create` from Zustand (not a global singleton).

### State Transitions

```
active --[checkbox checked]--> done (eject animation, item removed from list)
active --[menu "Delete"]--> archived (item moves to trash box)
active --[slingshot hits trash]--> archived (item moves to trash box)
archived --[menu "Restore"]--> active (item reappears in list)
archived --[menu "Delete forever"]--> removed from state
```

### Initial Data

Pre-populated with 5-8 sample todos + an "Add todo" input at the top of the list.

## Layout

The story uses `parameters: { layout: "fullscreen" }`.

```
Screen (fullscreen)
+---------------------------+---------------------------+
|                           |                           |
|   +-------------------+   |                           |
|   | [Add todo input]  |   |      (open space for      |
|   |-------------------|   |       slingshot arcs)      |
|   | [grip] [x] Todo 1 ...|   |                       |
|   | [grip] [x] Todo 2 ...|   |                       |
|   | [grip] [x] Todo 3 ...|   |                       |
|   +-------------------+   |                           |
|                           |                           |
|                           |              [Trash Box]  |
+---------------------------+---------------------------+
```

- Todo list panel: left half of the screen (`w-1/2`), with padding, in a card-like container
- Right half: open space for slingshot trajectories
- Trash box: fixed at bottom-right corner of the screen
- The SlingShot `boundsRef` points to the full-screen container

## Todo Item Anatomy

Each active todo item renders as a horizontal row:

```
[DragHandle] [Checkbox] [Label text]                    [...Menu]
```

- **DragHandle** (`Sortable.DragHandle`): renders `Icon.DragHandle` by default. Visible on hover only (opacity-0 -> opacity-100 via `group-hover/todo`). Receives `useSortable` attributes + listeners for reorder DnD.
- **Checkbox** (`Checkbox` primitive, size `sm`): when checked, triggers Eject imperatively via ref. Calls `checkTodo(id)`.
- **Label**: text span showing the todo label.
- **More menu** (`DropdownMenu` with `Icon.Dots` trigger): contains "Delete" item. Selecting "Delete" calls `archiveTodo(id)`.

### Hover behavior

The todo item row has `group/todo`. The DragHandle starts at `opacity-0` and becomes `opacity-100` on `group-hover/todo:opacity-100`, matching the `TableRowActionGroup` pattern. The more menu button (Dots icon) also follows the same hover pattern -- visible only on hover, plus stays visible when the dropdown is open (`has-[button[aria-expanded='true']]:opacity-100`).

## Interaction System 1: Eject (Checkbox Complete)

Each todo item is wrapped in an `<Eject>` component:
- `mode="disappear"` -- item flies off and doesn't come back
- `triggers={null}` -- no auto-trigger; imperative only via ref
- When checkbox is checked: call `ejectRef.current.eject()` and `checkTodo(id)`
- The Eject container is the full screen (item can fly anywhere)
- Item does not respawn and does not leave a ghost

## Prerequisite: SlingShot Multi-Item Refactor

The current SlingShot component supports exactly one projectile item per root. For the todo list, multiple items (each todo) must share one root and one goal (the trash box). This refactor modifies `sling-shot.tsx` to support multiple `SlingShot.Item` components within a single `SlingShot` root.

### Problem

Currently, `SlingShotRoot` tracks a single item's physics state via singleton refs (`itemRef`, `positionRef`, `velocityRef`, `pullVectorRef`, etc.) and a single flight simulation (`frameRef`). To have N items share one goal, we'd need N roots, each with its own invisible goal -- a fragile workaround.

### Solution: Per-item physics keyed by ID

Root manages a `Map<string, ItemPhysicsState>` instead of singleton refs. Goals remain shared (already a `Map<string, GoalRegistration>`). Only one item can be actively aimed at a time (one pointer), but multiple items can be in-flight simultaneously.

### API changes

**`SlingShot.Item`** gains an `id` prop:
```typescript
interface SlingShotItemProps extends SlingShotSlotProps {
  id?: string; // optional; falls back to React.useId() for backward compat
}
```

**Root callbacks** gain `itemId`:
```typescript
interface SlingShotProps extends React.ComponentProps<"div"> {
  // ... existing props unchanged ...
  onGoalHit?: (event: SlingShotHitEvent) => void;  // event gains `itemId: string`
  onLand?: (event: SlingShotLandEvent) => void;     // event gains `itemId: string`
  onLaunch?: (velocity: Vector, itemId: string) => void;
}

// Extended event types
interface SlingShotHitEvent {
  // ... existing fields ...
  itemId: string; // NEW
}
interface SlingShotLandEvent {
  // ... existing fields ...
  itemId: string; // NEW
}
```

**Arrow/Preview/Power** render for the currently active (aiming) item automatically. No API changes needed.

### Internal architecture

Per-item state managed in Root:
```typescript
interface ItemPhysicsState {
  element: HTMLElement | null;
  basePosition: Vector;
  position: Vector;
  velocity: Vector;
  pullVector: Vector;
  power: number;
  rotation: number;
  shakeOffset: Vector;
  isAiming: boolean;
  isFlying: boolean;
  pointerStart: Vector;
  itemStartCenter: Vector;
  frameId: number | null;
  hitGoalIds: Set<string>;
  captureElement: HTMLElement | null;
  pointerId: number | null;
}
```

Root context exposes (replaces single-item values):
```typescript
interface SlingShotContextValue {
  disabled?: boolean;
  activeItemId: string | null;
  registerItem: (id: string, element: HTMLElement) => () => void;
  registerGoal: (goal: SlingShotGoalRegistration) => () => void; // unchanged
  getItemTransform: (id: string) => { position: Vector; rotation: number; shakeOffset: Vector };
  getItemState: (id: string) => { isAiming: boolean; isFlying: boolean };
  onPointerDown: (itemId: string, event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (itemId: string, event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (itemId: string, event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel: (itemId: string, event: React.PointerEvent<HTMLElement>) => void;
  activeState: SlingShotState | null; // for Arrow/Preview/Power (the aiming item's state)
}
```

Each `SlingShot.Item`:
1. Calls `registerItem(id, element)` on mount, cleanup on unmount
2. Reads its own transform via `getItemTransform(id)`
3. Forwards pointer events to root with its ID: `onPointerDown(id, event)`

Root physics logic:
- `beginDrag(itemId, pointerId, clientX, clientY, target)` -- stores per-item
- `moveDrag(pointerId, clientX, clientY)` -- finds which item is active
- `endDrag(pointerId)` -- launches per-item flight
- `startFlight(itemId, pullVector)` -- runs per-item `requestAnimationFrame` loop
- Hit detection: unchanged (iterates goals map), but scoped per flying item

### Backward compatibility

- `SlingShot.Item` without `id` uses `React.useId()` -- single-item behavior identical
- Existing `sling-shot.stories.tsx` should pass without changes (each story already uses separate roots, which still works fine)
- `SlingShotHitEvent` and `SlingShotLandEvent` gain optional `itemId` field (defaults to auto-generated ID)

## Interaction System 2: SlingShot (Fling to Trash)

With the multi-item refactor, one `<SlingShot>` root wraps the entire screen. All todo items are `SlingShot.Item` components, and the trash box is a single `SlingShot.Goal`.

```tsx
<SlingShot boundsRef={screenRef} onGoalHit={({ itemId }) => archiveTodo(itemId)}>
  <SlingShot.Arrow />
  <SlingShot.Preview />
  <SlingShot.Power />

  <TodoListPanel>
    {activeTodos.map(todo => (
      <SlingShot.Item key={todo.id} id={todo.id}>
        <TodoItemBody todo={todo} />
      </SlingShot.Item>
    ))}
  </TodoListPanel>

  <SlingShot.Goal id="trash">
    <TrashBoxButton />
  </SlingShot.Goal>
</SlingShot>
```

- Dragging a todo body pulls it back like a slingshot
- `boundsRef` points to the full-screen container so items fly across the entire screen
- Arrow/Preview/Power render for whichever item is currently being aimed

### Hit behavior
- On goal hit (`onGoalHit`): `archiveTodo(itemId)` -- item moves to trash, removed from active list
- On miss (lands on ground): item stays where it landed on screen. It can be re-slingshot'd by dragging again.

### Interaction layering
- DragHandle grip icon: `@dnd-kit/sortable` reorder (vertical axis only)
- Todo body drag: SlingShot physics (free aim toward trash)
- Checkbox click: Eject animation
- These three systems do not conflict because they operate on separate DOM targets.

## Interaction System 3: FallingBlocks (Trash Box)

The trash box is a `Popover` whose trigger is a button with `Icon.Trash` (fixed bottom-right):
- Popover content wraps `<FallingBlocks.Root>`
- Each archived todo item renders as a `<FallingBlocks.Item>`
- When the popover opens, the falling blocks physics simulation starts
- The popover has fixed dimensions (e.g. `w-80 h-96`) to contain the physics

### Archived item appearance

Each falling block renders a miniature todo item that looks similar to the active version:
- Checkbox (checked state, disabled)
- Label text
- More menu with "Restore" and "Delete forever" items

### Actions
- "Restore": calls `restoreTodo(id)` -- item reappears in the active list, removed from falling blocks
- "Delete forever": calls `deleteTodo(id)` -- item removed from state entirely

## Sortable Compound Component

A declarative wrapper around `@dnd-kit`, in its own file `sortable.tsx`. Consistent with the Eject/SlingShot/FallingBlocks component style. Imported in `cool-todo.tsx` as `import { Sortable } from "./sortable"`.

```typescript
const Sortable = { Root, Item, DragHandle, Overlay };
```

### Sortable.Root
- Wraps `DndContext` + `SortableContext`
- Configures `PointerSensor` with `distance: 5` activation constraint
- Uses `closestCenter` collision detection
- Uses `restrictToVerticalAxis` modifier
- Props: `items: string[]`, `onReorder: (activeId: string, overId: string) => void`, plus standard div props

### Sortable.Item
- Wraps `useSortable({ id })`
- Provides sortable context to children (via React context) for DragHandle to consume
- Applies CSS transform and transition styles
- Exposes `isDragging` state for visual feedback
- Props: `id: string`, `asChild?: boolean`, plus standard div props

### Sortable.DragHandle
- Consumes sortable context to get `attributes` and `listeners`
- Renders as a `Button variant="hint"` with `Icon.DragHandle` as default children
- Can accept custom children to override the default icon
- Props: `children?: ReactNode`, plus Button props

### Sortable.Overlay
- Wraps `DragOverlay` from `@dnd-kit/core`
- Renders the currently dragged item's visual clone
- Props: standard DragOverlay props

## Styling

All styling uses Tailwind classes with the semantic tokens from `tooling/tailwind/base.css`:
- Backgrounds: `bg-main`, `bg-popover`, `bg-input`
- Text: `text-primary`, `text-secondary`, `text-muted`
- Borders: `border-border`, `border-border-button`
- Accents: `bg-blue` (checkbox checked), `text-red` (delete actions)
- Shadows: `shadow-out-md` for the card container

## Story Configuration

```typescript
const meta = {
  title: "interesting/Cool Todo",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <CoolTodo />,
};
```

## Future Enhancements (not in scope)

- Drag archived items from trash box back to the active list
- Keyboard shortcuts for todo actions
- Persistence (localStorage)
- Animations for restore/delete-forever in falling blocks
