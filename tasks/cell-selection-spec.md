# Spec: Table cell selection

Status: Approved by the user on September 8, 2026, including all proposed defaults. The technical plan is also approved. The task list is approved. Implementation and functional AC verification are complete on `feat/cell-selection`. The user deferred the coverage threshold for this first version.

## Objective

Let table users focus data cells and select rectangular ranges with mouse and keyboard while preserving existing cell editing. Selection must include every cell plugin, including title, and must not capture non-data controls.

## Requirement Sources

- User request and attached “Expected behavior” image, supplied September 8, 2026. The struck-out timeline sidebar scope is excluded.
- [TanStack React cell-selection guide, Mouse Interactions](https://tanstack.com/table/latest/docs/framework/react/guide/cell-selection#mouse-interactions), accessed September 8, 2026 through indexed documentation after direct fetch timed out.
- Existing repository code and package manifests inspected September 8, 2026.

The image defines product requirements; the guide informs selection interactions and APIs. Neither source supplies authority for unrelated actions.

## Scope and Acceptance Criteria

Each checkbox records **verified implementation**, not approval of the requirement. All requirements below are approved. Check an AC only after its complete behavior passes verification, and record the test name/command result or visual evidence in the verification record below. Keep failed or unverified ACs unchecked.

### Required by the image

- [x] **AC-01 — Table-only scope:** Selection UI and interactions apply only to `layout="table"`; timeline (including its sidebar), board, list, and other layouts do not acquire cell selection.
- [x] **AC-02 — All data plugins:** Every plugin-backed data cell is selectable, including title and checkbox; selection is not limited to text-like plugins.
- [x] **AC-03 — Non-data exclusions:** Headers, row action controls, drag handles, expansion controls, add-row controls, group headings, footer calculations, and trailing empty space are excluded from cell selection.
- [x] **AC-04 — Ordinary click:** Clicking a data cell retains its existing editing action and opens its editor when it has a popover editor.
- [x] **AC-05 — Editor visibility:** Cell-selection UI is hidden while a cell editing popover is open.
- [x] **AC-06 — Editor keyboard ownership:** Table shortcuts do not intercept keyboard input in an editor or its nested menus.
- [x] **AC-07 — Close restores focus:** Closing an editor establishes its cell as the focused single-cell selection.
- [x] **AC-08 — Escape event ordering:** Escape closes an open editor without also clearing the restored selection during the same event.
- [x] **AC-09 — Selection appearance:** Focused or selected cells use `bg-blue/5` overlay fill and the existing `shadow-cell-focus` inset outline, using `z-(--z-col)` and rounded outer corners.
- [x] **AC-10 — Non-intrusive visuals:** Selection visuals neither change cell dimensions nor intercept pointer events.
- [x] **AC-11 — Rectangular drag:** Dragging across data cells selects a rectangle without opening an editor or changing any cell values, including when dragging back toward the starting cell.
- [x] **AC-12 — Outside release:** Releasing the mouse outside the table ends the gesture; subsequent hovering does not extend selection, and the next ordinary click still works.
- [x] **AC-13 — Arrow navigation:** With table selection focus and no editor open, arrow keys move the focused cell.
- [x] **AC-14 — Shift-arrow extension:** Shift+arrow keys extend selection from its fixed anchor.
- [x] **AC-15 — Select all:** Cmd/Ctrl+A selects all selectable data cells when the table owns keyboard focus and no editor is open.
- [x] **AC-16 — Clear selection:** Escape clears cell selection when no editor is open.
- [x] **AC-17 — Existing controls:** Row selection, row/column dragging, resizing, links, and cell actions remain functional; using their own controls does not accidentally initiate cell selection.

### Approved guide-aligned behavior

- [x] **AC-18 — Shift-click:** Shift-click extends the current range from its anchor without opening an editor.
- [x] **AC-19 — Modifier rectangles:** Cmd/Ctrl-drag adds or subtracts a rectangle according to whether its starting cell is selected; modifier selection gestures do not open editors.
- [x] **AC-20 — TanStack integration:** Use the existing TanStack start/extend handlers and selection state, including its document-level mouseup cleanup, without introducing a separate rectangle engine.
- [x] **AC-21 — Continuous perimeter:** Draw the outer perimeter of each resulting selected region without internal blue edges between adjacent selected cells.

### Approved edge-case defaults

- [x] **AC-22 — Direct-action cells:** Ordinary checkbox clicks toggle and establish focus afterward; drag and modifier selection do not toggle. Other plugins without popovers retain their existing actions.
- [x] **AC-23 — Display order:** Selection and navigation follow displayed data-row and visible-column order, including pinned columns and expanded data rows.
- [x] **AC-24 — Hidden data exclusions:** Filtered-out rows, collapsed descendants, and hidden columns are excluded from navigation and select-all.
- [x] **AC-25 — Grid boundaries:** Arrow navigation clamps at the grid boundary without wrapping.
- [x] **AC-26 — Scope limits:** Do not add Tab/Enter editing shortcuts, clipboard operations, fill handles, touch gestures, or drag auto-scroll. Preserve existing keyboard activation behavior.
- [x] **AC-27 — Table keyboard scope:** Inputs, unrelated popovers, and other table instances retain their own keyboard behavior; selection shortcuts act only in the active table.
- [x] **AC-28 — Locked tables:** Locked-table editing restrictions remain intact while non-mutating cell selection is allowed.
- [x] **AC-29 — Structural invalidation:** Clear selection on layout changes and clear invalid endpoints after structural changes; closing an editor whose cell disappeared does not restore stale focus.
- [x] **AC-30 — New interaction wins:** Clicking another cell to close the old editor gives ownership to the new cell; the old editor does not steal focus back.

### Verification Record

For each verified AC, append an entry with its ID, test file and test name (or manual scenario), executed command/result, and any screenshot/artifact path needed to substantiate visual behavior. One entry may cover multiple ACs only when the evidence checks each of them. Requirement approval does not count as verification.

Evidence collected on September 8, 2026; functional browser verification is complete; the user deferred the coverage threshold for this first version.

| ACs                                                   | Evidence                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01, AC-02, AC-24, AC-28, AC-29                     | `packages/table-hook/src/__tests__/cell-selection.test.tsx`: table-layout invalidation, all plugin-backed cells while locked, hidden columns, collapsed groups, deleted endpoints, and value-edit preservation. Full hook suite: 376 tests passed.                                                                                                                                                    |
| AC-04–AC-08, AC-13–AC-16, AC-25, AC-26                | `packages/table-view/src/common/cell-selection.test.tsx`: editor Escape/focus/navigation, Shift-arrow/select-all/bounds, and existing Enter activation. Included in the 47-test post-handoff-fix integration run.                                                                                                                                                                                     |
| AC-02, AC-06–AC-08, AC-23, AC-27, AC-30               | `packages/table-view/src/common/cell-selection-lifecycle.test.tsx`: all nine popover plugin types, grouped navigation, switching editors, independent tables, unrelated inputs, and group-boundary outlines. Included in the 47-test integration run.                                                                                                                                                 |
| AC-03, AC-09–AC-12, AC-18, AC-19, AC-21, AC-22, AC-28 | `packages/table-view/src/common/cell-selection.test.tsx`: checkbox click/return-to-origin drag, copy-control exclusion, locked cells, modifier subtraction, and original overlay classes/perimeter edges.                                                                                                                                                                                             |
| AC-09–AC-12, AC-18, AC-19, AC-21–AC-24                | `apps/e2e/tests/cell-selection.spec.ts`: `DragAndContinuousPerimeter`, both modifier cases, `OutsideReleaseAndNewEditorOwnership`, `PinnedAndHiddenColumns`, `GroupingAndLayouts`, and `CheckboxDragAndLockedTable`. Browser assertions cover actual shadow CSS, unchanged bounding boxes, physical drag, and portal focus.                                                                           |
| AC-17                                                 | Final-build Chromium regression run: 72 of 73 passed; the remaining pinned-column test sent an arrow before editor closure completed. Added an explicit focus wait, then all 11 selection browser tests passed, covering that case and the date cancellation regression. Existing row/group/header drag, resizing, bulk editing, filtering, and timeline cases passed.                                |
| AC-20, AC-26                                          | Source review: existing TanStack selection handlers/state own ranges and mouseup cleanup; project code scopes lifecycle/navigation and renders perimeter. No new dependency, persisted API, clipboard, touch, fill, or auto-scroll feature. Independent read-only review covered the integration and identified one close-animation reopen issue; the lifecycle regression test now verifies its fix. |

Visual inspection confirmed the original translucent fill and inset shadow, including the pinned-column boundary:

- `apps/e2e/test-results/cell-selection-CellSelection-DragAndContinuousPerimeter-chromium/selection-perimeter.png`
- `apps/e2e/test-results/cell-selection-CellSelection-PinnedAndHiddenColumns-chromium/pinned-perimeter.png`

The existing `DatePicker_EscapeAfterTyping_CancelsWithoutResourceChange` test detected an early-focus blur commit. Focus restoration now waits for `onOpenChangeComplete`; that test and the other 46 focused regression tests pass. A follow-up review identified reopening during a closing animation; `use-cell-editor-selection.test.tsx` reproduces the ownership issue and verifies the fix plus unmount cleanup. That test, the date suite, and the lifecycle suite pass together (27 tests).

## Tech Stack

Manifest/catalog declarations: React ^19.2.3, TypeScript 6.0.3, `@tanstack/react-table` ^9.2.4, `@tanstack/table-core` 9.2.4, Tailwind ^4.2.2, Vitest 4.1.8, React Testing Library 16.3.2, Playwright ^1.57.0, pnpm 11.0.8. Reuse workspace UI primitives and existing dependencies.

## Current Repository Evidence

- `packages/table-hook/src/features/index.ts` already registers `cellSelectionFeature`.
- `packages/table-hook/src/table-contexts/use-table-view.tsx` constructs the table and uses stable data row IDs.
- `packages/table-view/src/common/cell.tsx` owns the common table cell frame and currently contains a commented-out focus overlay.
- `packages/table-view/src/table-body/table-row.tsx` renders pinned and center cells separately.
- `packages/table-view/src/table-contexts/table-view-content.tsx` owns the table surface.
- `packages/table-view/src/plugins/title/title-cell.tsx` includes editing and nested popovers; `plugins/checkbox/plugin.tsx` toggles directly on click.
- Existing theme tokens are exposed by `tooling/tailwind/base.css`.

These integration points informed the approved implementation plan in `tasks/plan.md`.

## Commands

Run from the repository root unless stated otherwise:

```sh
# Build table-view and its workspace dependencies
pnpm exec turbo run build --filter=@notion-kit/table-view
# Hook and component regression tests
pnpm --filter @notion-kit/table-hook test
pnpm --filter @notion-kit/table-view test
# Static checks for affected packages
pnpm --filter @notion-kit/table-hook --filter @notion-kit/table-view typecheck
pnpm --filter @notion-kit/table-hook --filter @notion-kit/table-view lint
# Format affected packages when implementation changes exist
pnpm --filter @notion-kit/table-hook --filter @notion-kit/table-view format --write
# Browser tests (pretest script builds packages and the fixture app)
pnpm --filter @notion-kit/e2e test:e2e --project=chromium
# Fixture development server; keep package watch running in another terminal
pnpm --filter @notion-kit/table-view dev
pnpm --filter @notion-kit/e2e dev
```

Never run `pnpm format`. These commands are identified from manifests; they have not been run for this documentation-only phase.

## Project Structure

- `packages/table-hook/src/features/`: headless features and state behavior.
- `packages/table-hook/src/__tests__/`: hook integration tests.
- `packages/table-view/src/common/`: shared cell and editor surfaces.
- `packages/table-view/src/table-contexts/` and `table-body/`: table integration and rendering.
- `packages/table-view/src/plugins/`: plugin-specific editing and existing colocated tests.
- `packages/table-view/src/__tests__/component-objects/`: reusable component test objects.
- `apps/e2e/tests/`: Playwright tests, including existing cell-editing, row-action, and drag regressions.
- `apps/e2e/src/app/table-view/`: browser fixture.
- `apps/docs/content/docs/`: product/component documentation.
- `tasks/cell-selection-spec.md`: this specification. The approved plan is in `tasks/plan.md`; the task breakdown is in `tasks/todo.md`.

## Code Style

Follow `.agents/guidelines/coding.md`; consult the component-primitives skill before editing components. Use named functions, explicit TypeScript props, existing `@/` aliases, double quotes, semicolons, and `cn` for merged classes. An existing style example from `common/cell.tsx`:

```tsx
function CompactFrame({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex empty:hidden", className)} {...props} />;
}
```

Reuse the plugin abstraction for shared selection behavior; do not assume only text-like plugins are data cells. Use reactive subscriptions scoped to affected cells/rows so dragging does not force unrelated editors to rerender.

## Testing Strategy

- Vitest hook tests: application-specific selectable-domain rules, navigation boundaries, anchor extension, select-all exclusions, layout changes, and invalid endpoints. Do not duplicate TanStack's internal geometry tests.
- React Testing Library integration tests: click/editor/close/focus transitions; title and checkbox handling; nested editor ownership; Escape ordering; modifier gestures; independent table instances; locked-table behavior.
- Playwright: real mouse drag in both directions, release outside table, no editor/value mutation after dragging, keyboard focus after editor close, pinned boundaries, grouped/expanded data rows, and existing DnD/row selection regressions.
- Visual browser inspection: exact theme tokens, 2px continuous perimeter, single-cell focus, no internal blue seams, and no geometry shifts across pinned columns.
- Cover every AC checkbox with behavioral assertions or an explicit visual check. Retain the existing table-view coverage thresholds (90% statements and branches) when running coverage; no additional arbitrary threshold is introduced.

## Boundaries

- Always: preserve existing editing semantics; use current workspace primitives and TanStack feature APIs; exclude non-data controls; isolate shortcuts to the active table; test relevant regressions before claiming completion; keep the spec updated as decisions change.
- Ask first: changes to approved requirements; dependency additions/upgrades; persisted/public selection API changes; CI or database changes; expansion beyond table layout.
- Never: add timeline selection in this scope; edit generated/vendor files; commit secrets; remove failing tests to obtain a passing run; hijack editor keyboard events; implement copy/paste or bulk mutation implicitly.

## Style Correction

The user clarified during implementation that the original commented cell-focus overlay is the intended design: `pointer-events-none absolute top-0 left-0 z-(--z-col) size-full rounded-sm bg-blue/5 shadow-cell-focus`. This correction supersedes the earlier image-derived solid background/border interpretation. Multi-cell selection retains a continuous outer perimeter without internal outlines.

## Review Decision

The user approved the specification and its proposed defaults with “同意” on September 8, 2026. No requirement questions remain open.

## Phase Gate

All six required specification areas are present and approved. The technical plan in `tasks/plan.md` is approved. `tasks/todo.md` is also approved; implement on the current branch as requested. All 30 functional ACs have verification evidence above. The user explicitly deferred coverage compliance for this first version; measured results and stopped comparison runs are recorded in `tasks/todo.md`.
