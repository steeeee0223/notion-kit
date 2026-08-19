# Cell Plugin Editor Composition — Task Checklist

## Task 1: Replace the headless cell-renderer contract

**Description:** Define `CellValueProps`, `CellEditorProps`, and the inline/
popover editor-result union in `@notion-kit/table-hook`. Make
`renderCellValue` mandatory, remove `renderCell`, and update factory types,
fixtures, and contract documentation without a legacy fallback.

**Acceptance criteria:**

- [ ] `CellPlugin` and `PluginFactoryConfig` expose the new renderer contract.
- [ ] All built-in factory implementations and test fixtures compile without `renderCell`.
- [ ] Plugin documentation describes the value/editor split and bulk eligibility rule.

**Verification:**

- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook typecheck`
- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test`

**Dependencies:** None

**Files likely touched:**

- `packages/table-hook/src/plugins/types.ts`
- `packages/table-hook/src/plugins/*/plugin.ts`
- `packages/table-hook/src/__tests__/mock.ts`
- `packages/table-hook/docs/plugins.md`

**Estimated scope:** Medium

## Task 2: Split primitive value and editor implementations

**Description:** Extract the visible and editable portions of text, link,
number, and checkbox cells. Reuse existing input components and preserve their
current display, normalization, tooltip, wrapping, copy, and empty-value rules.

**Acceptance criteria:**

- [ ] Each affected table-view wrapper registers a value renderer and the appropriate editor result.
- [ ] Checkbox registers an inline editor that performs a normal single-cell toggle.
- [ ] No affected component changes existing style tokens or layout-specific visibility rules.

**Verification:**

- [ ] Existing focused cell-renderer tests pass, with new value/editor interaction coverage.
- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view typecheck`

**Dependencies:** Task 1

**Files likely touched:**

- `packages/table-view/src/plugins/text/`
- `packages/table-view/src/plugins/link/`
- `packages/table-view/src/plugins/number/`
- `packages/table-view/src/plugins/checkbox/`
- `packages/table-view/src/plugins/cell-renderers.test.tsx`

**Estimated scope:** Medium

## Task 3: Migrate structured editor registrations

**Description:** Adapt select, multi-select, date, title, and derived-date
wrappers to the new contract. Keep existing `SelectMenu`, `DateTimePicker`,
configuration update paths, and title/derived-time bulk exclusions.

**Acceptance criteria:**

- [ ] Select and date use the same editor component in cell and bulk scopes.
- [ ] Select/date config edits continue to call the column configuration updater.
- [ ] Title and derived dates meet the approved eligibility semantics.

**Verification:**

- [ ] Focused select/date editor tests pass.
- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view test -- plugins`

**Dependencies:** Tasks 1-2

**Files likely touched:**

- `packages/table-view/src/plugins/select/`
- `packages/table-view/src/plugins/date/`
- `packages/table-view/src/plugins/title/`
- `packages/table-view/src/plugins/*/plugin.tsx`
- `packages/table-view/src/plugins/bulk-editors.test.tsx`

**Estimated scope:** Medium

## Task 4: Introduce shared single-cell composition across layouts

**Description:** Replace direct plugin renderer calls in `TableRowCell` and
`TableCell` with one shared host that selects inline or local-popover editing.
Migrate table, list, board property, timeline, and row-view consumers while
leaving the BoardCard title editor untouched.

**Acceptance criteria:**

- [ ] `TableCell` and `TableRowCell` share editor-prop construction and presentation handling.
- [ ] All five supported surfaces retain their current value and empty-state visibility behavior.
- [ ] Board title continues to use its existing dedicated interaction and passes its regression test.

**Verification:**

- [ ] Layout-focused table-view tests pass for table, list, board, timeline, and row view.
- [ ] Manual check confirms select and date popover placement did not change.

**Dependencies:** Tasks 2-3

**Files likely touched:**

- `packages/table-view/src/common/table-cell.tsx`
- `packages/table-view/src/table-body/table-row-cell.tsx`
- `packages/table-view/src/common/cell-*.tsx`
- `packages/table-view/src/{list-view,board-view,timeline-view,row-view}/`
- `packages/table-view/src/**/__tests__/*`

**Estimated scope:** Medium

## Task 5: Make bulk edit registry-driven

**Description:** Replace `BulkEditor`'s plugin-ID switch and plugin-specific
imports with the common editor props/result. Use one detached Popover handle
for popover results and direct inline rendering for checkbox.

**Acceptance criteria:**

- [ ] `BulkEditColumn` has no built-in type switch or plugin-specific editor import.
- [ ] Popover editors retain the current header icon trigger and `w-62` bulk content surface.
- [ ] Bulk checkbox is checked/unchecked/indeterminate from selected values and toggles to the approved final value.

**Verification:**

- [ ] Bulk bar tests cover a custom plugin, missing/disabled editors, detached popup behavior, and checkbox all-true/all-false/mixed cases.
- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view test -- bulk-edit`

**Dependencies:** Task 4

**Files likely touched:**

- `packages/table-view/src/common/bulk-edit/bulk-edit-bar.tsx`
- `packages/table-view/src/common/bulk-edit/bulk-edit-bar.test.tsx`
- `packages/table-view/src/plugins/checkbox/`
- `apps/storybook/src/stories/ui/popover.stories.tsx`

**Estimated scope:** Medium

## Task 6: Complete regression, documentation, and browser verification

**Description:** Update UI/plugin documentation and the existing browser
journey for the new direct bulk checkbox interaction. Run package checks and
perform the agreed visual regression pass; fix only regressions within scope.

**Acceptance criteria:**

- [ ] Documentation contains no stale `renderCell` or checkbox-menu guidance.
- [ ] Browser coverage verifies bulk checkbox direct toggle and existing bulk flows.
- [ ] All focused package checks pass with no unrelated working-tree changes included.

**Verification:**

- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test`
- [ ] `CI=true pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view test`
- [ ] Run package typecheck and lint commands for both packages under Node 24.11.1.
- [ ] Run the existing bulk-edit E2E journey and manually inspect table, list, and timeline bulk bars.

**Dependencies:** Task 5

**Files likely touched:**

- `packages/table-hook/docs/plugins.md`
- `packages/table-view/docs/plugins.md`
- `packages/table-view/docs/testing/`
- `apps/e2e/tests/bulk-edit.spec.ts`
- `docs/superpowers/specs/2026-08-19-cell-plugin-editor-composition-design.md`

**Estimated scope:** Small

## Final Definition of Done

- [ ] All six tasks and each acceptance criterion are complete.
- [ ] No `renderCell` remains in the active plugin API, source examples, or fixtures.
- [ ] No plugin-specific code remains in `BulkEditColumn`.
- [ ] The user has reviewed the implementation diff and verification results.
