# Todo: Config-driven table plugins

This checklist expands the implementation plan into small, verifiable tasks.
All pnpm commands must run under nvm Node.js `24.11.1` as `$NVM_BIN/pnpm` with
`--config.store-dir=/Users/awen/Documents/Codex/.pnpm-store`.

## Task 1: Publish the headless plugin subpath contract

**Description:** Add failing public-API/type tests, define the shared configured
factory contract, and publish `@notion-kit/table-hook/plugins` as a dedicated
runtime and declaration entry without relying on the table-hook root export.

**Acceptance criteria:**

- [ ] `/plugins` exports `CellPlugin`, supporting inference types, factory config types, and factory symbols.
- [ ] Required `icon`/`renderCell` and optional renderer/icon fields are enforced by TypeScript.
- [ ] The table-hook root no longer re-exports the plugin API.

**Verification:**

- [ ] Observe the focused public-API test fail before production changes and pass afterward.
- [ ] Tests pass: `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook exec vitest run src/plugins/config.test.tsx`.
- [ ] Build succeeds: `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook build`.

**Dependencies:** None

**Files likely touched:**

- `packages/table-hook/package.json`
- `packages/table-hook/tsdown.config.ts`
- `packages/table-hook/src/index.ts`
- `packages/table-hook/src/plugins/types.ts`
- `packages/table-hook/src/plugins/config.test.tsx`

**Estimated scope:** Medium: 5 files

## Task 2: Move shared plugin capabilities into table-hook

**Description:** Consolidate comparison helpers, text method descriptors, and
generic/checkbox counting policies in table-hook so each configured factory can
return a behavior-complete plugin without a table-view enhancer.

**Acceptance criteria:**

- [ ] Shared helpers preserve current empty-value, ordering, grouping, and counting behavior.
- [ ] Built-in factories can consume shared capabilities without importing table-view.
- [ ] ColumnsInfo initializes without fabricated renderer-bearing defaults.

**Verification:**

- [ ] Observe focused helper/initial-state tests fail before the move and pass afterward.
- [ ] Tests pass: table-hook calculation, sorting, grouping, and column-info suites.
- [ ] Source check: `rg -n "@notion-kit/table-view" packages/table-hook` returns no production dependency.

**Dependencies:** Task 1

**Files likely touched:**

- `packages/table-hook/src/plugins/utils.tsx`
- `packages/table-hook/src/plugins/index.ts`
- `packages/table-hook/src/features/columns-info.ts`
- `packages/table-hook/src/__tests__/columns-info.test.tsx`
- `packages/table-hook/src/__tests__/plugin-methods.test.tsx`

**Estimated scope:** Medium: 5 files

## Checkpoint: Public foundation

- [ ] Tasks 1-2 focused tests are green.
- [ ] Table-hook typecheck and build succeed independently.
- [ ] Review the exported declaration shape before migrating plugin families.

## Task 3: Migrate title and text factories

**Description:** Move title/text metadata, defaults, conversions, descriptors,
and renderer prop adaptation into configured table-hook factories, then make the
table-view implementations thin component-injection wrappers.

**Acceptance criteria:**

- [ ] `title(config)` and `text(config)` preserve current plugin objects except for injected React nodes/callbacks.
- [ ] Title `showIcon` and row-icon adaptation remains headless behavior.
- [ ] Existing TitleCell/TextCell UI tests remain in table-view and pass.

**Verification:**

- [ ] Observe title/text factory contract tests fail before the move and pass afterward.
- [ ] Tests pass: focused table-hook title/text behavior and table-view title/text component suites.
- [ ] Manual object check confirms plugin IDs, defaults, method IDs, and descriptions are unchanged.

**Dependencies:** Tasks 1-2

**Files likely touched:**

- `packages/table-hook/src/plugins/title.tsx`
- `packages/table-hook/src/plugins/text.tsx`
- `packages/table-hook/src/plugins/title-text.test.tsx`
- `packages/table-view/src/plugins/title/plugin.tsx`
- `packages/table-view/src/plugins/text/plugin.tsx`

**Estimated scope:** Medium: 5 files

## Task 4: Migrate link and checkbox factories

**Description:** Move email/phone/URL and checkbox semantics into configured
table-hook factories while retaining LinkCell, CheckboxCell, and checkbox group
rendering as injected table-view components.

**Acceptance criteria:**

- [ ] Link factories preserve IDs, metadata, scalar conversion, text methods, and type-specific rendering input.
- [ ] Checkbox preserves checked-first comparison, labels, grouping, and checkbox-specific counting.
- [ ] Table-view wrappers contain no comparator, descriptor, conversion, or counting logic.

**Verification:**

- [ ] Observe focused link/checkbox behavior tests fail before the move and pass afterward.
- [ ] Tests pass: table-hook link/checkbox tests and table-view cell-renderer tests.
- [ ] UI callback spies receive the same effective props as current components.

**Dependencies:** Tasks 1-2

**Files likely touched:**

- `packages/table-hook/src/plugins/link.tsx`
- `packages/table-hook/src/plugins/checkbox.tsx`
- `packages/table-hook/src/plugins/link-checkbox.test.tsx`
- `packages/table-view/src/plugins/link/plugin.tsx`
- `packages/table-view/src/plugins/checkbox/plugin.tsx`

**Estimated scope:** Medium: 5 files

## Task 5: Migrate number semantics and factory

**Description:** Move number conversion, formatting, grouping, calculation
descriptors, and configured factory construction to table-hook; leave cells and
config/grouping components in table-view.

**Acceptance criteria:**

- [ ] Number defaults, schema conversion, empty ordering, interval grouping, and calculation registrations are unchanged.
- [ ] Calculation and grouping formatting share the moved pure number formatter.
- [ ] The table-view number wrapper only supplies icons and renderers.

**Verification:**

- [ ] Observe moved number behavior/format tests fail against the old ownership and pass after migration.
- [ ] Tests pass: focused number factory, format, calculation, and current config-menu suites.
- [ ] Typecheck confirms NumberPlugin/NumberConfig are imported from `/plugins`.

**Dependencies:** Tasks 1-2

**Files likely touched:**

- `packages/table-hook/src/plugins/number/plugin.tsx`
- `packages/table-hook/src/plugins/number/format.ts`
- `packages/table-hook/src/plugins/number/plugin.test.tsx`
- `packages/table-hook/src/plugins/number/format.test.ts`
- `packages/table-view/src/plugins/number/plugin.tsx`

**Estimated scope:** Medium: 5 files

## Task 6: Migrate select semantics and factories

**Description:** Move select/multi-select defaults, conversion, transfer,
comparison, grouping, and single-select renderer adaptation to table-hook while
keeping option menus and visual components in table-view.

**Acceptance criteria:**

- [ ] Select and multi-select preserve option conversion, transfer config, first-option semantics, and method registrations.
- [ ] The single-select array adapter is owned and tested by the configured headless factory.
- [ ] UI reducers/hooks remain in table-view unless they are required directly by headless semantics.

**Verification:**

- [ ] Observe select factory/adapter tests fail before the move and pass afterward.
- [ ] Tests pass: table-hook select contracts and all table-view select menu/config interaction suites.
- [ ] Custom renderer spies verify single- and multi-select change payloads.

**Dependencies:** Tasks 1-2

**Files likely touched:**

- `packages/table-hook/src/plugins/select/plugin.tsx`
- `packages/table-hook/src/plugins/select/types.ts`
- `packages/table-hook/src/plugins/select/plugin.test.tsx`
- `packages/table-view/src/plugins/select/plugin.tsx`
- `packages/table-view/src/plugins/select/types.ts`

**Estimated scope:** Medium: 5 files

## Task 7: Migrate date and derived-time semantics

**Description:** Move date data/config types, timezone formatting, date
capabilities/calculations, and date/created-time/last-edited-time factories to
table-hook while injecting existing picker, cell, menu, and grouping renderers.

**Acceptance criteria:**

- [ ] Date and derived-time IDs, defaults, row-derived values, timezone semantics, group methods, and calculations remain unchanged.
- [ ] Created/edited renderer prop adaptation happens before the configured UI callback.
- [ ] Pure date formatting tests run in table-hook; picker/input interaction tests remain in table-view.

**Verification:**

- [ ] Observe date factory/format tests fail before the move and pass afterward.
- [ ] Tests pass: table-hook date contracts/utilities and table-view date component suites.
- [ ] Boundary checks cover empty, timezone, range, created-at, and last-edited-at behavior.

**Dependencies:** Tasks 1-2

**Files likely touched:**

- `packages/table-hook/src/plugins/date/plugin.tsx`
- `packages/table-hook/src/plugins/date/types.ts`
- `packages/table-hook/src/plugins/date/utils.ts`
- `packages/table-hook/src/plugins/date/plugin.test.tsx`
- `packages/table-view/src/plugins/date/plugin.tsx`

**Estimated scope:** Medium: 5 files

## Checkpoint: Plugin families

- [ ] Tasks 3-7 focused tests are green in both packages.
- [ ] Every built-in factory can run with stub UI callbacks in table-hook tests.
- [ ] No migrated table-view wrapper contains headless behavior.

## Task 8: Convert table-view default assembly into UI configuration

**Description:** Assemble all existing icons/components into the no-argument
table-view wrappers and rebuild `DEFAULT_PLUGINS` directly from behavior-complete
headless factory results in the current order.

**Acceptance criteria:**

- [ ] Every table-view factory remains callable with no arguments.
- [ ] Both current icon variants and all current renderers are injected.
- [ ] `DEFAULT_PLUGINS` preserves exact IDs/order and no longer applies behavioral enhancers.

**Verification:**

- [ ] Add a failing wrapper/default-assembly test before changing the assembly.
- [ ] Tests pass: table-view plugin wrapper, renderer, and provider tests.
- [ ] Snapshot/object assertions exclude React identity but cover IDs, defaults, and callback presence.

**Dependencies:** Tasks 3-7

**Files likely touched:**

- `packages/table-view/src/plugins/index.ts`
- `packages/table-view/src/plugins/utils.tsx`
- `packages/table-view/src/plugins/plugins.test.tsx`
- `packages/table-view/src/table-contexts/table-view-provider.tsx`
- `packages/table-view/src/__tests__/mock.ts`

**Estimated scope:** Medium: 5 files

## Task 9: Enforce the new import boundary

**Description:** Update internal and external repository consumers so headless
contracts/factories come from `/plugins`, while configured UI factories continue
to come from table-view.

**Acceptance criteria:**

- [ ] No source file imports plugin contracts or headless factories from the table-hook root.
- [ ] Table-view public UI factory imports remain valid.
- [ ] Storybook, registry, docs app, and e2e packages typecheck with the new exports.

**Verification:**

- [ ] Source search finds only intended `@notion-kit/table-hook/plugins` imports.
- [ ] Affected package typechecks pass.
- [ ] Table-hook and table-view builds resolve their public subpaths.
- [ ] Apply the mechanical import rewrite in batches of at most five files and verify each batch before continuing.

**Dependencies:** Task 8

**Files likely touched:**

- `packages/table-hook/src/**/*.ts(x)` imports
- `packages/table-view/src/**/*.ts(x)` imports
- `apps/storybook/src/stories/collections/table-view/**/*.tsx`
- `apps/docs/content/docs/blocks/table-view/**/*.mdx`
- `packages/registry/src/table-view-*/**/*.tsx`

**Estimated scope:** Medium mechanical rewrite, processed and verified per consumer group

## Task 10: Move plugin documentation and behavior tests

**Description:** Relocate plugin architecture documentation/assets and finish
splitting behavior tests into table-hook while leaving UI interaction tests next
to table-view components.

**Acceptance criteria:**

- [ ] `plugins.md` and both images live under `packages/table-hook/docs` with correct links and ownership language.
- [ ] Headless tests import no table-view code and UI tests remain in table-view.
- [ ] No obsolete copies remain under `packages/table-view/docs`.

**Verification:**

- [ ] Markdown image references resolve to moved files.
- [ ] Both packages' focused plugin test suites pass.
- [ ] Source search classifies remaining table-view plugin tests as component/UI coverage.

**Dependencies:** Tasks 8-9

**Files likely touched:**

- `packages/table-hook/docs/plugins.md`
- `packages/table-hook/docs/plugins-1.png`
- `packages/table-hook/docs/plugins-2.png`
- `packages/table-hook/src/plugins/plugins.test.tsx`
- `packages/table-view/src/plugins/plugins.test.tsx`

**Estimated scope:** Medium: 5 files

## Task 11: Verify custom and mixed plugin workflows

**Description:** Add contract coverage proving developers can still implement a
`CellPlugin` directly, create their own factory, and mix custom/headless/configured
plugins in TableView without a registry restriction.

**Acceptance criteria:**

- [ ] A direct custom `CellPlugin` compiles and participates in generic method discovery.
- [ ] A custom config-driven factory compiles without table-view.
- [ ] A mixed plugin array works with configured table-view defaults.

**Verification:**

- [ ] Observe at least one custom/mixed workflow test fail before its required contract change and pass afterward.
- [ ] Table-hook custom-plugin and table-view mixed-plugin integration tests pass.
- [ ] Type inference preserves the custom plugin ID/data/config union.

**Dependencies:** Tasks 8-10

**Files likely touched:**

- `packages/table-hook/src/plugins/custom-plugin.test.tsx`
- `packages/table-hook/src/__tests__/plugin-methods.test.tsx`
- `packages/table-view/src/plugins/custom-plugin.test.tsx`
- `packages/table-view/src/table-contexts/table-view-provider.tsx`

**Estimated scope:** Medium: 4 files

## Checkpoint: Consumers and compatibility

- [ ] Tasks 8-11 tests and typechecks are green.
- [ ] Public import examples match built declaration exports.
- [ ] Human-reviewable diff shows table-view wrappers are UI-only.

## Task 12: Run the complete verification matrix

**Description:** Run formatting and all relevant package checks, inspect the
final dependency/export surface, and resolve only regressions caused by this
migration.

**Acceptance criteria:**

- [ ] Both packages pass test, typecheck, lint, format, and build.
- [ ] Affected consumers compile and no forbidden imports/dependencies remain.
- [ ] Git diff contains no unintended UI or unrelated changes.

**Verification:**

- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test`.
- [ ] `$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-view test`.
- [ ] Run `typecheck`, `lint`, `format`, and `build` for both package filters.
- [ ] Run affected consumer checks and final `rg` dependency/import audits.

**Dependencies:** Tasks 1-11

**Files likely touched:** None unless verification exposes an in-scope regression

**Estimated scope:** Small verification task

## Final review

- [ ] Every task's acceptance criteria are checked.
- [ ] Every task has recorded red/green verification evidence.
- [ ] No task introduced UI design changes.
- [ ] The implementation matches the approved spec.
- [ ] The branch is ready for review.
