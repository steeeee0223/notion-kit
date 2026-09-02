# Table UI Plugin Registry TODO

## Task 1: Make table-hook plugins data-only

**Description:** Remove React and UI responsibilities from `CellPlugin`, its
factory inputs, built-in factory implementations, and grouping feature.

**Acceptance criteria:**

- [ ] `@notion-kit/table-hook` exposes no UI renderer, icon, or React-node plugin type.
- [ ] All built-in core factories instantiate without UI configuration.
- [ ] Grouping exposes raw data rather than rendering React content.

**Verification:**

- [ ] `nvm use 24.11.1 --silent; CI=true pnpm -F @notion-kit/table-hook test`
- [ ] `nvm use 24.11.1 --silent; CI=true pnpm -F @notion-kit/table-hook typecheck`

**Dependencies:** None

**Files likely touched:**

- `packages/table-hook/src/plugins/types.ts`
- `packages/table-hook/src/plugins/**/plugin.ts`
- `packages/table-hook/src/features/grouping.ts`
- `packages/table-hook/src/plugins/plugins.test.ts`

**Estimated scope:** Medium

## Task 2: Define the UI-plugin registry

**Description:** Add table-view-local UI plugin props/types, separate default
data/UI registries, and a resolver that validates paired IDs.

**Acceptance criteria:**

- [ ] UI types contain `surface` and direct `ReactNode` render callbacks only in table-view.
- [ ] The resolver rejects duplicate IDs and data plugins with no UI adapter.
- [ ] The table-view public API accepts one typed `plugins: { data, ui }` pair;
      table-hook receives only `plugins.data`.
- [ ] No combined-plugin array, adapter, overload, or neutral-rendering fallback remains.

**Verification:**

- [ ] Focused registry tests cover valid, missing, and duplicate registrations.
- [ ] `nvm use 24.11.1 --silent; CI=true pnpm -F @notion-kit/table-view typecheck`

**Dependencies:** Task 1

**Files likely touched:**

- `packages/table-view/src/plugins/types.ts`
- `packages/table-view/src/plugins/index.ts`
- `packages/table-view/src/table-contexts/table-view-provider.tsx`
- `packages/table-view/src/__tests__/mock.ts`

**Estimated scope:** Medium

## Task 3: Move property and type-menu UI lookups

**Description:** Route property type menus, property configuration menus, and
default-property metadata through resolved UI plugins.

**Acceptance criteria:**

- [ ] No table-view menu reads UI metadata or config renderers from a data plugin.
- [ ] Default property names, icons, and widths come from UI adapter metadata.
- [ ] Persisted property icons continue to override UI adapter defaults.

**Verification:**

- [ ] Existing type-menu and prop-menu tests pass after fixture migration.
- [ ] Manual check: create and edit each built-in property type.

**Dependencies:** Task 2

**Files likely touched:**

- `packages/table-view/src/menus/types-menu.tsx`
- `packages/table-view/src/menus/prop-menu.tsx`

**Estimated scope:** Medium

## Task 4: Introduce direct cell UI composition

**Description:** Replace `CellPresentation`, result interpretation, and host
copy/empty/type branches with direct `renderCell` invocation plus reusable
table-view `CellTrigger`/`CellPopover` helpers.

**Acceptance criteria:**

- [ ] `Cell.Content` does not inspect a built-in plugin ID or a presentation type.
- [ ] UI plugins receive `surface`, property metadata, data/config, text value, and mutation callbacks.
- [ ] Shared helpers preserve existing popover geometry, close behavior, disabled state, and trigger semantics.
- [ ] Moved class names preserve the current computed visual output; no new
      visual variant or styling decision is introduced.

**Verification:**

- [ ] Focused cell-trigger and direct cell-rendering tests pass.
- [ ] Manual check: table, list, board, row-view, and timeline frames remain visually unchanged.

**Dependencies:** Tasks 2-3

**Files likely touched:**

- `packages/table-view/src/common/cell.tsx`
- `packages/table-view/src/common/cell-trigger.tsx`
- `packages/table-view/src/common/cell-popover.tsx`
- `packages/table-view/src/plugins/utils.tsx`
- `packages/table-view/src/table-contexts/default-column.tsx`

**Estimated scope:** Medium

## Task 5: Migrate text-like, number, and date adapters

**Description:** Implement direct UI plugins for text, email, phone, URL,
number, date, created time, and last-edited time using shared cell/editor
helpers where their behavior is equivalent.

**Acceptance criteria:**

- [ ] Each adapter owns its surface-specific empty state, trigger classes, and copy button.
- [ ] Email, phone, and URL retain safe href behavior.
- [ ] Date keeps its existing popover close policy; derived times remain read-only.
- [ ] Table/list/board/row-view/timeline output is visually identical before
      and after the ownership move.

**Verification:**

- [ ] Existing text, link, number, and date renderer tests pass.
- [ ] Manual check: copy controls appear on the same surfaces as before.

**Dependencies:** Task 4

**Files likely touched:**

- `packages/table-view/src/plugins/text/**`
- `packages/table-view/src/plugins/link/**`
- `packages/table-view/src/plugins/number/**`
- `packages/table-view/src/plugins/date/**`

**Estimated scope:** Medium

## Task 6: Migrate select, checkbox, and title adapters

**Description:** Move the remaining built-ins to direct UI rendering while
retaining their distinct interaction models.

**Acceptance criteria:**

- [ ] Select/multi-select preserve option/config/editor behavior and option tooltips.
- [ ] Checkbox is directly interactive in cells and bulk edit without a host ID branch.
- [ ] Title owns table/list/timeline rendering and row actions inside its adapter; it has no bulk editor.
- [ ] No title or checkbox visual treatment changes as a consequence of the refactor.

**Verification:**

- [ ] Existing select, checkbox, title, and row-view tests pass.
- [ ] Manual check: title row-open and checkbox keyboard/pointer activation work in every supported surface.

**Dependencies:** Task 4

**Files likely touched:**

- `packages/table-view/src/plugins/select/**`
- `packages/table-view/src/plugins/checkbox/**`
- `packages/table-view/src/plugins/title/**`
- `packages/table-view/src/timeline-view/**`

**Estimated scope:** Medium

## Checkpoint: After Tasks 1-6

- [ ] Table-hook has no React-valued plugin contract.
- [ ] Table-view renders every built-in through a UI adapter.
- [ ] No remaining cell/bulk plugin-ID behavior branch exists.

## Task 7: Move bulk editing to UI adapters

**Description:** Make the bulk-edit bar invoke optional `renderBulkEditor`
nodes and use UI adapter metadata for icon triggers and labels.

**Acceptance criteria:**

- [ ] Bulk-edit eligibility derives only from `renderBulkEditor` availability.
- [ ] Popover and inline bulk controls are fully rendered by the adapter.
- [ ] No bulk-edit behavior reads `disableBulkEdit`, `renderCellEditor`, or default icons from data plugins.

**Verification:**

- [ ] Existing bulk-edit tests pass, including checkbox and custom paired plugin cases.
- [ ] Manual check: text edit, date edit, select edit, and checkbox bulk toggle update selected rows.

**Dependencies:** Tasks 3, 5, and 6

**Files likely touched:**

- `packages/table-view/src/common/bulk-edit/bulk-edit-bar.tsx`
- `packages/table-view/src/common/bulk-edit/*.test.tsx`

**Estimated scope:** Small

## Task 8: Move grouping UI rendering to adapters

**Description:** Replace table-hook's React-valued grouping render path with
raw grouping data, then render grouped table and board labels through the
resolved UI adapter.

**Acceptance criteria:**

- [ ] Table-hook grouping exposes no `renderGroupingValue` method or React return value.
- [ ] Every UI adapter explicitly supplies `renderGroupingValue`, using
      `DefaultGroupingValue` directly when its output is generic.
- [ ] Grouped table and board rows invoke the grouping column's UI adapter with no host fallback.

**Verification:**

- [ ] Existing grouping tests pass after moving UI assertions to table-view.
- [ ] Manual check: grouping labels remain correct for text, select, checkbox, and date columns.

**Dependencies:** Tasks 1, 2, 5, and 6

**Files likely touched:**

- `packages/table-hook/src/features/grouping.ts`
- `packages/table-view/src/table-body/table-grouped-row.tsx`
- `packages/table-view/src/board-view/board-group.tsx`
- Grouping tests in both packages

**Estimated scope:** Medium

## Task 9: Migrate fixtures, docs, and public examples

**Description:** Convert all internal fixtures, mocks, plugin documentation,
and public examples to paired data/UI plugin registration.

**Acceptance criteria:**

- [ ] No code or docs construct a data plugin with React renderer callbacks.
- [ ] Custom plugin examples demonstrate paired registry registration.
- [ ] Tests use the paired default registries and explicit custom UI adapters.

**Verification:**

- [ ] Repository search finds no removed renderer/presentation symbols outside migration notes.
- [ ] Package build declarations expose the intended API.

**Dependencies:** Tasks 1-8

**Files likely touched:**

- `packages/table-hook/docs/plugins.md`
- `packages/table-hook/src/mock.ts`
- `packages/table-view/src/__tests__/**`
- `packages/table-view/src/**/*.test.tsx`

**Estimated scope:** Medium

## Task 10: Full verification and review

**Description:** Run package quality gates and complete a surface-by-surface
manual regression review.

**Acceptance criteria:**

- [ ] All table-hook and table-view tests, typechecks, lint, and format checks pass.
- [ ] Manual review confirms table, list, board, row-view, and timeline behavior for every built-in property family.
- [ ] The diff has no compatibility adapter, legacy registry input,
      `CellPresentation`, or `CellEditorResult` remnants.
- [ ] Manual review finds no visual difference from the current table/list/board/row-view/timeline behavior.

**Verification:**

- [ ] `nvm use 24.11.1 --silent; CI=true pnpm -F @notion-kit/table-hook test`
- [ ] `nvm use 24.11.1 --silent; CI=true pnpm -F @notion-kit/table-view test`
- [ ] Run `typecheck`, `lint`, and `format` for both packages with the same Node/store setup.

**Dependencies:** Task 9

**Files likely touched:**

- Verification output only, unless an approved correction is required.

**Estimated scope:** Small
