# Cell Plugin Empty Semantics TODO

Source of truth:
`docs/superpowers/specs/2026-09-01-cell-plugin-empty-semantics-design.md`

Detailed execution plan:
`docs/superpowers/plans/2026-09-01-cell-plugin-empty-semantics.md`

## Contract and Semantics

- [x] Add required `CellPlugin.isEmpty(data: Data): boolean`.
- [x] Add the approved empty semantics to every built-in plugin.
- [x] Route table-hook empty filters, counts, sorting, and grouping through the
      plugin callback at their existing boundaries.
- [x] Normalize missing properties to `plugin.default.data` before calling
      `isEmpty` where the caller can observe absent data.
- [x] Remove old truthiness-based empty aggregators and named registry entries;
      add no legacy fallback.

## Table-Hook

- [x] Bind empty/non-empty filter operators to the plugin callback.
- [x] Bind empty/non-empty and checked/unchecked counting to the callback.
- [x] Normalize empty sorting values through `plugin.isEmpty`.
- [x] Normalize empty grouping values through `plugin.isEmpty`.
- [x] Correct production mocks and required existing table-hook tests only.
- [x] Avoid unrelated test additions and low-value TDD coverage.

## Table-View

- [x] Replace `isCompactEmpty` and `isRowViewEmpty` with
      `plugin.isEmpty(cellData)`.
- [x] Delete `getCopyValue`; copy directly from `plugin.toTextValue`.
- [x] Delete `SelectOptionTooltipContext` and `SelectOptionTooltipScope`.
- [x] Enable each valid select option tooltip on every surface.
- [x] Keep the outer list/board property tooltip and accept nested tooltips.
- [x] Remove the select plugin-ID branch from `cell.tsx`.
- [x] Keep title ID checks as accepted exceptions.
- [x] Do not change renderer props or presentation metadata.
- [x] Do not initially modify table-view tests or test-support files.

## Documentation

- [x] Update table-hook plugin contract documentation.
- [x] Update table-view responsibility/audit documentation.
- [x] Update docs-site direct plugin examples.
- [x] Record remaining checkbox/copy/presentation ID checks as deferred design
      debt owned by future cell value rendering work.

## Final-Only Validation

- [x] Finish every source, required table-hook test, mock, and documentation
      correction before validation.
- [x] Run format fixes for the changed workspaces.
- [x] Run table-hook: typecheck, lint.
- [ ] Run existing table-hook tests.
- [ ] Run existing unchanged table-view tests.
- [ ] If table-view typecheck fails only on direct test plugins missing
      `isEmpty`, report exact locations and request approval before touching them.
- [ ] Run table-view: typecheck, lint.
- [ ] Run final removed-symbol and plugin-ID audits.
- [x] Hand off to the user for manual review without opening Codex browser view.
