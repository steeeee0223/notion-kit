# Table Cell Selection Tasks

Status: Task list approved by the user on September 8, 2026. The first version is implemented and functionally verified on `feat/cell-selection`. The user deferred coverage compliance.

Sources: [AC checklist](cell-selection-spec.md), [approved plan](plan.md).

## Execution and Evidence Rules

Execute T1–T8 sequentially in this task after task-list approval. Each implementation task first adds a meaningful failing behavior test, implements the minimal change, then runs the listed verification. All commands run from the repository root. Existing files may be changed; explicitly marked new files do not exist yet.

Task completion and AC completion are distinct: a task checkbox means its deliverable and verification passed. Check a spec AC only after all its mapped tasks pass and the AC's full behavior has evidence in the spec's Verification Record. Keep unverified or partially verified ACs unchecked. Do not substitute code inspection for browser evidence where focus, drag events, or visual geometry matters.

Paths listed under each task are the expected edit set. Read-only references are unrestricted. If work needs more than approximately five edited files, split the deliverable into another reviewed task rather than hiding unrelated changes. No new dependencies, persisted APIs, or changes to approved scope.

## Ordered Tasks

- [x] **T1 — Selectable data domain and invalidation**
  - Depends on: approved plan.
  - AC: AC-01, AC-02, AC-03, AC-20, AC-23, AC-24, AC-28, AC-29.
  - Acceptance: use the registered TanStack feature; enable only table data cells; verify actual displayed rows/columns for normal and grouped fixtures, hidden columns, collapsed descendants, filtering and pinning. Navigation/select-all must exclude synthetic rows. Clear invalid endpoints/layout selection; locked state does not disable selection. No parallel geometry state or persisted selection resource.
  - Files: new `packages/table-hook/src/features/cell-selection.ts`; `packages/table-hook/src/table-contexts/use-table-view.tsx`; new `packages/table-hook/src/__tests__/cell-selection.test.tsx`.
  - Verify: `pnpm --filter @notion-kit/table-hook test src/__tests__/cell-selection.test.tsx`; `pnpm --filter @notion-kit/table-hook typecheck`.
  - Evidence: assertions for selected row/column IDs and navigation endpoints, including title/checkbox and locked fixtures; all commands pass.

- [x] **T2 — Text editing and drag selection vertical slice**
  - Depends on: T1.
  - AC: AC-04, AC-05, AC-07, AC-08, AC-11, AC-12, AC-18, AC-19, AC-20, AC-30.
  - Acceptance: add a table-scoped coordinator and frame capture handling; connect shared `CellEditorPopover` lifecycle. Ordinary text clicks edit; editor close establishes focus; Escape does not clear it in the same event. Drag and modifiers suppress their generated click, including a drag that returns to its origin. Outside release ends the gesture; subsequent click edits normally. Session ownership prevents a stale editor callback from claiming another cell's focus.
  - Files: new `packages/table-view/src/table-contexts/cell-selection-provider.tsx`; `packages/table-view/src/table-contexts/table-view-content.tsx`; `packages/table-view/src/common/cell.tsx`; `packages/table-view/src/common/cell-renderer.tsx`; new `packages/table-view/src/common/cell-selection.test.tsx`.
  - Verify: `pnpm --filter @notion-kit/table-view test src/common/cell-selection.test.tsx`; `pnpm --filter @notion-kit/table-view typecheck`.
  - Evidence: rendered text-editor transitions and selection membership assertions; no text value mutation on drag. Browser event-order proof is completed by T7.

- [x] **T3 — Shared lifecycle bridge and editor coverage**
  - Depends on: T2.
  - AC: AC-02, AC-04, AC-05, AC-06, AC-07, AC-08, AC-29, AC-30.
  - Acceptance: extract the shared editor integration into an internal hook and connect title's `TextInputPopover`. Exercise existing text, number, select/multi-select, link, and date shared-editor paths. Nested menus retain input ownership; close/unmount from an old session cannot clear a newer session. Committing an edit in controlled and uncontrolled tables preserves post-close selection after the data update settles. Deleted/hidden cells are never refocused. Optional selection context is inert outside a table, including standalone editor tests.
  - Files: new `packages/table-view/src/common/use-cell-editor-selection.ts`; `packages/table-view/src/common/cell-renderer.tsx`; `packages/table-view/src/common/text-input-popover.tsx`; `packages/table-view/src/table-contexts/cell-selection-provider.tsx`; `packages/table-view/src/common/cell-selection.test.tsx`.
  - Verify: `pnpm --filter @notion-kit/table-view test src/common/cell-selection.test.tsx src/common/text-input-popover.test.tsx src/plugins`; `pnpm --filter @notion-kit/table-view typecheck`.
  - Evidence: parameterized editor lifecycle tests and explicit nested-menu, committed-update, deleted-cell, and editor-to-editor cases. Do not introduce a public custom-plugin lifecycle API without approval.

- [x] **T4 — Direct actions and non-data control exclusions**
  - Depends on: T3.
  - AC: AC-02, AC-03, AC-17, AC-22, AC-28.
  - Acceptance: ordinary checkbox clicks toggle once and focus; dragging/modifiers never toggle. Preserve all existing direct actions. Exclude expansion, title icon/page links, copy buttons, row actions, and drag handles from cell gestures. Locked cells remain selectable with no edits. Verify selection at the common frame for a custom plugin so inclusion does not depend on a built-in plugin ID.
  - Files: `packages/table-view/src/common/cell.tsx`; `packages/table-view/src/common/cell-trigger.tsx`; `packages/table-view/src/common/copy-button.tsx`; `packages/table-view/src/plugins/title/title-cell.tsx`; `packages/table-view/src/common/cell-selection.test.tsx`.
  - Verify: `pnpm --filter @notion-kit/table-view test src/common/cell-selection.test.tsx src/common/cell-trigger.test.tsx src/table-body/table-row-selection.test.tsx`; `pnpm --filter @notion-kit/table-view typecheck`.
  - Evidence: checkbox values, action invocation counts and unchanged selection for excluded controls; locked-table and custom-renderer assertions.

- [x] **T5 — Scoped keyboard navigation**
  - Depends on: T4.
  - AC: AC-06, AC-08, AC-13, AC-14, AC-15, AC-16, AC-23, AC-24, AC-25, AC-26, AC-27.
  - Acceptance: approved shortcuts use TanStack navigation/range operations with fixed anchors and clamped boundaries. Handle keys before trigger propagation blocks them, but never intercept editor/input/contenteditable/portal events. Cmd/Ctrl+A affects only the active table. Preserve existing Enter/Space activation and add no new shortcuts. Test two table instances and unrelated controls.
  - Files: `packages/table-view/src/table-contexts/cell-selection-provider.tsx`; `packages/table-view/src/common/cell.tsx`; `packages/table-view/src/common/cell-trigger.tsx`; `packages/table-view/src/common/cell-selection.test.tsx`; `packages/table-view/src/common/cell-trigger.test.tsx`.
  - Verify: `pnpm --filter @notion-kit/table-view test src/common/cell-selection.test.tsx src/common/cell-trigger.test.tsx`; `pnpm --filter @notion-kit/table-view typecheck`.
  - Evidence: focused IDs and selected IDs after each key, unchanged editor input handling, isolated table state, preserved activation, and no wrapping at each boundary.

- [x] **T6 — Selection fill and continuous perimeter**
  - Depends on: T5.
  - AC: AC-05, AC-09, AC-10, AC-21.
  - Acceptance: use the original `bg-blue/5`, `shadow-cell-focus`, `z-(--z-col)` and rounded outer corners; pointer-transparent inset outline follows resolved selection edges without changing dimensions. Adjacent selected cells have no internal blue seams; subtraction holes and focused-but-excluded cells render correctly. Selection UI hides while editing. Use narrow subscriptions that also refresh neighboring perimeter changes, without subscribing the entire table body to selection.
  - Files: `packages/table-view/src/common/cell.tsx`; new `packages/table-view/src/common/cell-selection-overlay.tsx`; `packages/table-view/src/common/cell-selection.test.tsx`.
  - Verify: `pnpm --filter @notion-kit/table-view test src/common/cell-selection.test.tsx`; `pnpm --filter @notion-kit/table-view typecheck`.
  - Evidence: overlay edge/visibility and pointer-event assertions. Exact colors, 2px geometry, pinned clipping, and wrapped-row appearance remain unchecked until T7 browser inspection.

- [x] **T7 — Real-browser interaction and visual verification**
  - Depends on: T6.
  - AC: AC-01 through AC-19, AC-21 through AC-30 (browser verification); AC-20 is reviewed in T8.
  - Acceptance: browser tests cover ordinary editing/close, title, checkbox, bidirectional drag, return-to-origin drag, release outside, Shift-click, Cmd/Ctrl inclusion/subtraction, all approved keys, nested editor focus, and clicking another editor. Include pinned columns, grouping/expanded data, hidden/filtered data, locked tables, and unaffected layouts. Inspect fill and continuous border for single-cell, adjacent range, subtraction hole, pinned boundary, and wrapped-row cases; assert unchanged cell bounding boxes and click-through visuals.
  - Files: new `apps/e2e/tests/cell-selection.spec.ts`; `apps/e2e/tests/component-objects/table-view.ts`; `apps/e2e/src/test-fixtures/table-view.ts` (only if existing fixtures lack a required case).
  - Verify: `pnpm --filter @notion-kit/e2e test:e2e cell-selection.spec.ts --project=chromium` (the existing pretest builds packages and fixture app).
  - Evidence: named Playwright scenarios with pass results and screenshots for visual ACs. Test both Control and Meta modifier paths. Do not treat DOM-only tests as proof of portal focus or physical drag behavior.

- [x] **T8 — Regression checks and AC evidence reconciliation**
  - Depends on: T7.
  - AC: AC-01 through AC-30, final verification reconciliation.
  - Acceptance: all focused and relevant regression checks pass; inspect changes for TanStack reuse, scope exclusions, and no unauthorized API/dependency changes. Preserve existing coverage thresholds. Append actual test/visual evidence to the spec, check only fully verified ACs, and record actual results in this task list. If a defect requires code edits, return to the owning task, reopen its affected ACs, and rerun the justified checks before completing T8.
  - Files: `tasks/cell-selection-spec.md`; `tasks/plan.md`; `tasks/todo.md`.
  - Verify: execute the final command block below; inspect browser visual evidence from T7 and code integration for AC-20/AC-26. No implementation AC can be marked complete just because its requirement was approved.

## Final Verification Commands

```sh
pnpm --filter @notion-kit/table-hook test
pnpm --filter @notion-kit/table-view test
pnpm --filter @notion-kit/table-view coverage
pnpm --filter @notion-kit/table-hook --filter @notion-kit/table-view typecheck
pnpm --filter @notion-kit/table-hook --filter @notion-kit/table-view lint
pnpm --filter @notion-kit/e2e typecheck
pnpm --filter @notion-kit/e2e lint
pnpm --filter @notion-kit/e2e test:e2e --project=chromium
git diff --check
```

Original target: successful exits, including existing 90% statement/branch coverage requirements for table-view. The user subsequently deferred coverage compliance for this first version; the thresholds remain unchanged. The E2E pretest performs the package/application build. Format changed packages beforehand with `pnpm --filter <package> format --write`; never run `pnpm format`. Broaden or repeat checks only after new changes, failures, or unresolved concerns justify it.

## AC Ownership Matrix

All listed tasks must pass before the corresponding AC is checked. T8 reconciles evidence for every AC.

| AC    | Implementation / focused verification | Browser verification        |
| ----- | ------------------------------------- | --------------------------- |
| AC-01 | T1                                    | T7                          |
| AC-02 | T1, T3, T4                            | T7                          |
| AC-03 | T1, T4                                | T7                          |
| AC-04 | T2, T3                                | T7                          |
| AC-05 | T2, T3, T6                            | T7                          |
| AC-06 | T3, T5                                | T7                          |
| AC-07 | T2, T3                                | T7                          |
| AC-08 | T2, T3, T5                            | T7                          |
| AC-09 | T6                                    | T7                          |
| AC-10 | T6                                    | T7                          |
| AC-11 | T2                                    | T7                          |
| AC-12 | T2                                    | T7                          |
| AC-13 | T5                                    | T7                          |
| AC-14 | T5                                    | T7                          |
| AC-15 | T5                                    | T7                          |
| AC-16 | T5                                    | T7                          |
| AC-17 | T4                                    | T7, T8 regressions          |
| AC-18 | T2                                    | T7                          |
| AC-19 | T2                                    | T7                          |
| AC-20 | T1, T2, T8 code review                | T7 outside-release behavior |
| AC-21 | T6                                    | T7                          |
| AC-22 | T4                                    | T7                          |
| AC-23 | T1, T5                                | T7                          |
| AC-24 | T1, T5                                | T7                          |
| AC-25 | T5                                    | T7                          |
| AC-26 | T5, T8 scope review                   | T7 existing activation      |
| AC-27 | T5                                    | T7                          |
| AC-28 | T1, T4                                | T7                          |
| AC-29 | T1, T3                                | T7                          |
| AC-30 | T2, T3                                | T7                          |

## Phase Gate and Results

Task-list approval received: “可以。請在此分支開始實作”. Implementation has been applied on `feat/cell-selection`. All 30 functional ACs and T1–T7 have been checked against hook, component, and browser evidence. T8 is complete under the user’s explicit first-version exception for coverage compliance.

## Verification Results

- Full table-hook suite: 20 files, 376 tests passed.
- Table-view close-handoff regression: 47 tests passed. Follow-up reopening/unmount, editor lifecycle, and date regression: 27 tests passed.
- Final application and table-view builds passed.
- Final Chromium regression run: 72 passed, one pinned-column scenario failed because its arrow key preceded completed editor closure. After adding a focus assertion before navigation, all 11 selection browser scenarios passed. No production change was required for that test correction.
- Table-hook/table-view/e2e typecheck passed. Lint has no errors; table-view retains one pre-existing `h1` class warning in `row-view/full-view.tsx:39`.
- The first complete successful table-view coverage test run passed all 480 tests; statements 93.03%, branches 87.72%. The branch gate failed against the unchanged 90% threshold. The user then explicitly deferred coverage compliance for this first version. The additional latest-code and original-source coverage comparison runs were stopped (exit 130), not counted as passes. The original-source baseline was not established. Coverage execution uses `--maxWorkers=2 --testTimeout=30000` to accommodate instrumentation overhead; assertions and repository configuration are unchanged.
- Visual artifacts and AC mappings are in `tasks/cell-selection-spec.md`.

User delivery decision: “coverage 可以先不用達標。我希望這個 feature 先有一版”. Functional ACs remain verified; branch coverage compliance is deferred and is not claimed to pass.
