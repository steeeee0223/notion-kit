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
