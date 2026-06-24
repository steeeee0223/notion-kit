# Sortable Stories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three Storybook stories that demonstrate menu-based vertical sorting and a board-view-styled Kanban with sortable columns and cross-column cards.

**Architecture:** Create one self-contained story module. The two list stories use `MenuGroup` and `MenuItem` through the `Sortable` render API; the Kanban story holds normalized column/card state and uses one `Sortable.Root`, typed sortable items, column droppable regions, and a card overlay.

**Tech Stack:** React 19, TypeScript, Storybook 10, `@notion-kit/ui/primitives`, `@notion-kit/icons`, dnd-kit React/helpers, Tailwind CSS, Storybook Vitest assertions.

---

## File Structure

- Create `apps/storybook/src/stories/ui/sortable.stories.tsx`: fixtures, private demo components, board movement helpers, three stories, and play assertions.
- Verify with the existing Storybook TypeScript, ESLint, Vitest-browser, and production-build commands. No production package files change.

### Task 1: Menu-based vertical list stories

**Files:**
- Create: `apps/storybook/src/stories/ui/sortable.stories.tsx`

- [ ] **Step 1: Add failing story assertions and fixtures**

Create metadata titled `Notion UI/Sortable`, define stable `{ id, label, icon }` fixtures, and add `play` assertions that expect menu items named `Inbox`, `Roadmap`, and `Archive`. For the explicit-handle story, also expect buttons named `Move Inbox`, `Move Roadmap`, and `Move Archive`.

```tsx
const meta = {
  title: "Notion UI/Sortable",
  parameters: { layout: "centered" },
} satisfies Meta;

const assertMenuItems = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  for (const label of ["Inbox", "Roadmap", "Archive"]) {
    await expect(canvas.getByRole("menuitem", { name: label })).toBeVisible();
  }
};
```

- [ ] **Step 2: Run the story test and confirm the new expectations fail**

Run: `pnpm --filter @notion-kit/storybook test -- src/stories/ui/sortable.stories.tsx`

Expected: FAIL because the story renderers do not yet provide the asserted menu items.

- [ ] **Step 3: Implement the explicit-handle list**

Use `useState`, pass ordered IDs to `Sortable.Root`, map `onItemsChange` IDs back to strings, render `Sortable.List` as `MenuGroup`, and render every `Sortable.Item` as a `MenuItem`. Put the handle in `MenuItemAction`.

```tsx
<Sortable.Item
  id={item.id}
  index={index}
  render={
    <MenuItem icon={item.icon} label={item.label}>
      <MenuItemAction>
        <Sortable.Handle aria-label={`Move ${item.label}`} />
      </MenuItemAction>
    </MenuItem>
  }
/>
```

- [ ] **Step 4: Implement the full-row sidebar list**

Reuse the same fixtures in independent local state. Render `Sortable.List` as `MenuGroup` and each `Sortable.Item` as `MenuItem`, but omit `Sortable.Handle` so the complete menu row is the drag surface.

```tsx
<Sortable.Item
  id={item.id}
  index={index}
  className="rounded-sm"
  render={<MenuItem icon={item.icon} label={item.label} />}
/>
```

- [ ] **Step 5: Run focused verification**

Run: `pnpm --filter @notion-kit/storybook typecheck`

Expected: PASS with no TypeScript diagnostics.

Run: `pnpm --filter @notion-kit/storybook test -- src/stories/ui/sortable.stories.tsx`

Expected: PASS for both list stories.

- [ ] **Step 6: Commit the list-story increment**

```bash
git add apps/storybook/src/stories/ui/sortable.stories.tsx
git commit -m "feat: add sortable menu list stories"
```

### Task 2: Sortable Kanban board story

**Files:**
- Modify: `apps/storybook/src/stories/ui/sortable.stories.tsx`

- [ ] **Step 1: Add failing board story assertions**

Add a `KanbanBoard` play function that expects column headings `Not started`, `In progress`, and `Done`, plus sample cards `Write project brief`, `Build sortable story`, and `Ship documentation`. Expect labeled column handles such as `Move Not started column`.

- [ ] **Step 2: Run the focused story test and confirm failure**

Run: `pnpm --filter @notion-kit/storybook test -- src/stories/ui/sortable.stories.tsx`

Expected: FAIL because the Kanban renderer does not yet provide the asserted board.

- [ ] **Step 3: Implement normalized board state and movement**

Define `BoardColumn`, `BoardCard`, and `BoardItems = Record<string, string[]>`. Add `findCardColumn` and `moveBoardCards`. First delegate card-to-card movement to dnd-kit's `move`; when the target is an empty/list droppable, remove the source ID from its old column and append it to `target.data.columnId`.

```tsx
function findCardColumn(items: BoardItems, cardId: string) {
  return Object.keys(items).find((columnId) =>
    items[columnId]?.includes(cardId),
  );
}

function moveBoardCards(items: BoardItems, event: DragOverEvent | DragEndEvent) {
  const { source, target } = event.operation;
  if (!source || !target) return items;
  const moved = move(items, event);
  if (moved !== items) return moved;
  const sourceId = String(source.id);
  const sourceColumnId = findCardColumn(items, sourceId);
  const targetColumnId = target.data.columnId;
  if (
    !sourceColumnId ||
    target.type !== "board-list" ||
    typeof targetColumnId !== "string" ||
    !items[targetColumnId]
  ) return items;
  return {
    ...items,
    [sourceColumnId]: items[sourceColumnId]!.filter((id) => id !== sourceId),
    [targetColumnId]: [
      ...(sourceColumnId === targetColumnId
        ? items[sourceColumnId]!.filter((id) => id !== sourceId)
        : items[targetColumnId]!),
      sourceId,
    ],
  };
}
```

- [ ] **Step 4: Implement card and column composition**

Use a single horizontal `Sortable.Root`. Columns are `Sortable.Item` values with `type="board-column"`, `accept="board-column"`, and a labeled header handle. Each column creates a low-priority `useDroppable` region with `type="board-list"`, `accept="board-card"`, and `{ columnId }`. Cards are nested vertical `Sortable.Item` values with `group={column.id}`, `type="board-card"`, `accept="board-card"`, `{ columnId, title }`, and `modifiers={[]}` so they can cross parent boundaries.

- [ ] **Step 5: Implement drag lifecycle and overlay**

On card drag start, snapshot the board and record the active card. On drag over, apply `moveBoardCards`. On canceled drag end, restore the snapshot; always clear active state. Pass column IDs to `Sortable.Root.onItemsChange` for horizontal column reordering. Render the active card through `Sortable.Overlay`.

- [ ] **Step 6: Match board-view styling**

Use 260px columns, 12px column gaps, rounded group containers, compact headers, count buttons, 8px card gaps, popover-background cards, button borders, muted secondary controls, and a `New page` button. Keep fixture content limited to a title and one muted property line.

- [ ] **Step 7: Run focused verification**

Run: `pnpm --filter @notion-kit/storybook typecheck`

Expected: PASS.

Run: `pnpm --filter @notion-kit/storybook test -- src/stories/ui/sortable.stories.tsx`

Expected: PASS for all three stories.

- [ ] **Step 8: Commit the board-story increment**

```bash
git add apps/storybook/src/stories/ui/sortable.stories.tsx
git commit -m "feat: add sortable Kanban story"
```

### Task 3: Browser and repository verification

**Files:**
- Modify only if verification reveals a defect: `apps/storybook/src/stories/ui/sortable.stories.tsx`

- [ ] **Step 1: Run formatting and lint checks**

Run: `pnpm exec prettier --check apps/storybook/src/stories/ui/sortable.stories.tsx`

Expected: PASS.

Run: `pnpm --filter @notion-kit/storybook lint -- src/stories/ui/sortable.stories.tsx`

Expected: PASS.

- [ ] **Step 2: Build Storybook**

Run: `pnpm --filter @notion-kit/storybook build`

Expected: PASS and generate `apps/storybook/storybook-static`.

- [ ] **Step 3: Verify interactions in a real browser**

Start Storybook and verify: explicit handle list reorders only from its handle; sidebar list reorders from the full row; columns reorder horizontally; cards reorder within a column; cards move to another column; and a card can move into an empty column. Confirm there are no console errors.

- [ ] **Step 4: Review final diff**

Run: `git diff --check && git status --short`

Expected: no whitespace errors and only the intended story/plan changes.
