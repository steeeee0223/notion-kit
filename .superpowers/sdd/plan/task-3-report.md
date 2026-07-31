# Task 3 report: property header is the menu trigger and drag handle

## Changed files

- `apps/e2e/tests/drag-and-drop.spec.ts`
  - Replaces the keyboard-only header regression with one Notes locator that
    opens and closes the property menu, performs a pointer drag, waits for DnD
    cleanup, and checks rendered/controlled order plus the exact move action.
- `packages/table-view/src/table-header/table-header-cell.tsx`
  - Renders the visible property header as the dropdown trigger and
    `Sortable.Handle`, removes the separate narrow drag handle, and disables
    drop animation only for header items.
- `packages/table-view/src/table-header/table-header-row.tsx`
  - Snapshots and defers the controlled column update by one macrotask so the
    DnD manager can synchronously finish its drop cleanup first.
- `packages/table-view/src/table-header/table-header-row.test.ts`
  - Verifies the deferred callback is asynchronous and receives stable source,
    target, transform, and projected-index values after the live entities
    change.
- `packages/table-hook/src/features/columns-info.ts`
  - Accepts a same-ID drop when the sortable source carries a changed projected
    index, while retaining canceled, missing-target, and unchanged self-drop
    guards.
- `packages/table-hook/src/__tests__/columns-info.test.tsx`
  - Covers the projected self-target reorder and exact `properties.move`
    action.
- `packages/ui/src/primitives/sortable.tsx`
  - Adds a per-item `dropAnimation` override that composes with default or
    caller-provided sortable plugins.
- `packages/ui/src/primitives/sortable.test.ts`
  - Characterizes pointer self-target events that must use the source's
    projected index.
- `.superpowers/sdd/plan/task-3-report.md`
  - Records Task 3 implementation and verification evidence.

## RED

The new same-locator Playwright test first opened the menu successfully, but
pointer activation never started while the visible header was still a plain
button and the independent narrow handle owned DnD.

After composing the visible trigger with `Sortable.Handle`, the drag projected
Notes after Score and emitted the expected controlled update, but the source
and hidden placeholder remained stuck as two `[data-dragging]` elements after
`mouse.up()`.

The table-hook regression independently failed before the projected-index
guard:

```text
ColumnDrag_SelfTargetWithProjectedIndex_EmitsExactPropertyMove
Expected: ["col2", "col1"]
Received: ["col1", "col2"]
```

The deferred-snapshot unit test also recorded a focused RED before extraction:

```text
TypeError: deferColumnDragEnd is not a function
Test Files  1 failed (1)
Tests       1 failed (1)
```

## GREEN

Focused pointer regression:

```sh
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test:e2e tests/drag-and-drop.spec.ts --grep HeaderPointerDnD
```

```text
1 passed
```

The header-only combination that resolved cleanup is:

1. Per-item `Feedback.configure({ dropAnimation: null })` for column headers.
2. Snapshot the drag-end projection and run the existing synchronous
   `table.handleColumnDragEnd` callback in the next macrotask.

This lets the provider clear drag state before the controlled React reorder,
without changing row/list DnD behavior or the table-hook API contract.

Unit verification:

```text
@notion-kit/ui sortable:       1 file, 8 tests passed
@notion-kit/table-hook column: 1 file, 27 tests passed
@notion-kit/table-view full:   35 files, 319 tests passed
```

Final Playwright regression command:

```sh
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/e2e test:e2e tests/drag-and-drop.spec.ts tests/header-actions.spec.ts --grep "HeaderPointerDnD|HeaderResize|HeaderActions_TitleAndLockedView"
```

```text
3 passed
```

Static verification:

```text
@notion-kit/ui typecheck:         exit 0
@notion-kit/table-hook typecheck: exit 0
@notion-kit/table-view typecheck: exit 0
Changed-file ESLint (all three packages): exit 0
Prettier changed-file write/check: all files formatted
git diff --check: exit 0
```

## Self-review

- The same accessible Notes button is both the Base UI menu trigger and the
  DnD handle; no nested button or duplicate drag control remains.
- Menu open/close is asserted before pointer drag, so the test proves both
  interaction contracts on the same locator without inspecting component
  internals.
- Pointer cleanup reaches zero before controlled order and action assertions;
  the regression cannot pass with a visually stuck dropping item.
- The deferred callback captures only the column handler's required stable
  operation fields and is covered against later entity mutation.
- `dropAnimation={null}` is applied only to table header items. Rows and all
  other sortable consumers keep their existing feedback and timing.
- Resize and locked-header Playwright regressions remain green.
- No Task 1/2 files or untracked `tasks/` content was changed.

## Concerns

- Base UI 1.6 can leave this menu visibly open after a single synthetic Escape
  in the production-build Playwright harness even when the trigger reports
  `aria-expanded="false"`. The regression uses the trigger's supported toggle
  contract and waits for the item to become hidden before dragging; no menu
  workaround was added to production.

## Review fix round 1

### Findings

- The pointer E2E asserted controlled property order but did not independently
  prove the rendered column positions changed.
- The initial cleanup fix deferred every header drag-end callback and left its
  timer alive across component unmount or handler replacement. Only the
  projected same-target event requires the DnD-cleanup ordering boundary.

### RED

The revised hook tests were run before the lifecycle-owned hook existed:

```text
Test Files  1 failed (1)
Tests       8 failed (8)
TypeError: useColumnDragEnd is not a function
```

The cases require canceled, missing-source, missing-target, different-target,
and unchanged self-target events to invoke the table handler synchronously;
only a non-canceled self-target with distinct numeric initial/projected indices
may defer. Separate tests require pending deferred work to be canceled on
unmount and handler replacement.

### GREEN

- Added a post-cleanup bounding-box assertion that polls until
  `Score.x < Notes.x`, before checking controlled state and the exact action.
- Replaced the unconditional helper with `useColumnDragEnd`, which:
  - calls ordinary/canceled/malformed drag-end events synchronously;
  - snapshots and defers only the projected self-target case;
  - owns one pending timer and cancels it on replacement, unmount, or a newer
    drag-end event.

Focused unit verification:

```text
Test Files  1 passed (1)
Tests       8 passed (8)
```

Fresh package/static verification:

```text
@notion-kit/table-view full: 35 files, 326 tests passed
@notion-kit/table-view typecheck: exit 0
Changed-file ESLint: exit 0
Changed-file Prettier check: exit 0
```

Final Playwright command retained pointer cleanup, resize, and lock coverage:

```text
3 passed
```

### Self-review

- The visual assertion observes real header geometry rather than the controlled
  JSON mirror.
- Synchronous paths preserve the pre-fix table-handler timing and event object.
- The deferred callback cannot mutate a replacement table/handler after its
  owner has been cleaned up.
- Row/list sortable timing and table-hook APIs remain unchanged.

## Review fix round 2

### Finding

The pending timer cleanup used a passive `useEffect`. A zero-delay timer can
run during the next commit's layout phase before passive cleanup processes an
unmount or handler replacement.

### RED

The lifecycle tests now execute queued timers from a later layout effect,
reproducing the real phase-ordering race rather than relying on RTL `act` to
flush all effects:

```text
Test Files  1 failed (1)
Tests       2 failed | 6 passed (8)
```

Both failures called the stale handler once: one during unmount and one during
handler replacement.

### GREEN

Changed timer cleanup ownership from passive `useEffect` to
commit-synchronous `useLayoutEffect`. The existing routing, stable snapshot,
and timer behavior remain unchanged.

```text
Focused header hook: 1 file, 8 tests passed
@notion-kit/table-view typecheck: exit 0
Changed-file ESLint: exit 0
Changed-file Prettier check: exit 0
git diff --check: exit 0
```

### Self-review

- The cleanup now runs before any later layout effect can flush the timer.
- The tests fail under passive cleanup and pass under layout cleanup, directly
  guarding the phase-ordering regression.
- No E2E, table-hook, shared sortable, or row/list behavior changed in this
  round.

## Review fix round 3

### Finding

Base UI 1.6 opens `Menu.Trigger` on `mousedown`. A header pointer drag therefore
opened the property menu before DnD activation, even though the trigger later
reported `aria-expanded="false"` after cleanup.

The installed Base UI API identifies this transition with the
`trigger-press` reason and permits its default state update to be canceled via
`eventDetails.cancel()`.

### RED

The pointer regression first added post-drag assertions for both the trigger
state and the Calculate menu item. On the pre-fix current code, cleanup,
rendered/controlled order, the exact action, and `aria-expanded="false"` all
passed, but the menu item stayed visible:

```text
HeaderPointerDnD_SameNotesTriggerOpensMenuAndMovesAfterScore
expect(calculateMenuItem).toBeHidden()
Timed out 5000ms: element remained visible
1 failed
```

### GREEN

The dropdown is now controlled. Base UI `trigger-press` transitions are
canceled, while the trigger's real `click` toggles the controlled state.
Outside press, item selection, and Escape continue through `onOpenChange`, and
a drag ending on `BODY` emits no click, so it cannot open the menu.

Focused pointer regression:

```text
1 passed
```

Combined header browser regressions, covering click open/close, post-drag
hidden/collapsed state, resize, and locked headers:

```text
3 passed
```

Fresh package/static verification:

```text
@notion-kit/table-view full test: exit 0
@notion-kit/table-view typecheck: exit 0
@notion-kit/e2e typecheck: exit 0
Changed-file ESLint: exit 0
Changed-file Prettier check: exit 0
git diff --check: exit 0
```

### Self-review

- Pointer clicks still open and close the property menu on the same accessible
  header locator; browser keyboard activation also produces the click used by
  the controlled toggle.
- Only Base UI's `trigger-press` state transition is canceled. Supported close
  reasons remain owned by the primitive's `onOpenChange` contract.
- Pointer drag cleanup and its exact move action remain unchanged, and the new
  authority assertion proves the menu is not merely ARIA-collapsed while still
  visible.
- Locked triggers remain disabled and additionally guard the explicit toggle.
- No coordinate or timer heuristic was introduced, and no untracked `tasks/`
  content was changed.
