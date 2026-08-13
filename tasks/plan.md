# Implementation Plan: Config-driven table plugins

## Overview

Move all built-in table plugin semantics to config-driven factories under
`@notion-kit/table-hook/plugins`. Keep `@notion-kit/table-view` as the owner of
the existing React components and expose no-argument wrappers plus its configured
`DEFAULT_PLUGINS`. Preserve custom plugin support and all existing UI behavior.

## Architecture decisions

- Headless plugin contracts and factories are public only through
  `@notion-kit/table-hook/plugins`.
- Every built-in factory requires `icon` and `renderCell`; `defaultIcon`,
  `renderConfigMenu`, and `renderGroupingValue` are optional where applicable.
- Behavioral prop adaptation stays with the headless factory; table-view wrappers
  only inject existing components and icons.
- `CellPlugin` remains open and structurally implementable by developers.
- `table-hook` does not expose a fake `DEFAULT_PLUGINS`; table-view owns the only
  preconfigured default list.
- Tests and docs follow behavior ownership, while UI interaction coverage remains
  in table-view.

## Dependency graph

```text
Subpath export and shared plugin config contract
    |
    +-- Shared behavior utilities
    |       |
    |       +-- Title/text/link/checkbox factories
    |       +-- Number factory
    |       +-- Select factories
    |       +-- Date/time factories
    |               |
    +---------------+-- Table-view UI wrappers and DEFAULT_PLUGINS
                            |
                            +-- Repository import migration
                            +-- Docs migration
                                    |
                                    +-- Full verification
```

## Task list

### Phase 1: Public contract and shared foundation

- [ ] Task 1: Publish the headless plugin subpath contract
- [ ] Task 2: Move shared plugin capabilities into table-hook

### Checkpoint: Foundation

- [ ] New public-contract tests pass in `@notion-kit/table-hook`.
- [ ] `@notion-kit/table-hook/plugins` builds declaration and runtime entries.
- [ ] No production file in table-hook imports table-view.

### Phase 2: Plugin-family vertical slices

- [ ] Task 3: Migrate title and text factories
- [ ] Task 4: Migrate link and checkbox factories
- [ ] Task 5: Migrate number semantics and factory
- [ ] Task 6: Migrate select semantics and factories
- [ ] Task 7: Migrate date semantics and factories
- [ ] Task 8: Convert table-view plugins into UI wrappers

### Checkpoint: Plugin families

- [ ] Headless behavior tests pass from table-hook for all built-in plugin IDs.
- [ ] Existing table-view component tests pass unchanged in behavior.
- [ ] Configured `DEFAULT_PLUGINS` preserves its current IDs and order.

### Phase 3: Consumers and documentation

- [ ] Task 9: Enforce the new import boundary across the repository
- [ ] Task 10: Move plugin documentation and behavior tests
- [ ] Task 11: Verify custom plugin and mixed-plugin workflows

### Checkpoint: Consumers

- [ ] Storybook, registry, docs, and e2e TypeScript consumers use valid imports.
- [ ] No headless plugin API is imported from the table-hook root.
- [ ] Plugin docs reside under `packages/table-hook/docs` with working assets.

### Phase 4: Final quality gate

- [ ] Task 12: Run the complete verification matrix

### Checkpoint: Complete

- [ ] Both packages pass tests, typecheck, lint, format, and build.
- [ ] A source search confirms one-way package dependency and the intended exports.
- [ ] No UI design, interaction, plugin semantics, IDs, or default order changed.
- [ ] Ready for human review.

## Execution notes

- Use test-driven development for every behavior move: add or move a focused test,
  observe the expected failure, add the minimum production change, then refactor.
- Keep each plugin-family slice green before starting the next family.
- Preserve all unrelated worktree changes if any appear during implementation.
- Use nvm Node.js `24.11.1` and invoke pnpm as `$NVM_BIN/pnpm` with the configured
  global store at `/Users/awen/Documents/Codex/.pnpm-store`.

## Parallelization opportunities

After Tasks 1 and 2 establish the contract, Tasks 3 through 7 are conceptually
independent by plugin family. If parallel agents are explicitly requested later,
assign one family per agent and reserve Task 8 for integration after all family
branches agree on the shared config type. Tasks 9 through 12 remain sequential
because they depend on the final public surface.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Behavioral code remains in a table-view wrapper | High | Assert headless descriptors in table-hook tests and keep wrappers limited to config objects. |
| Renderer prop adaptation moves to the wrong layer | High | Test title, select, and derived-time adapters through configured factories before wrapper integration. |
| Existing icons or interactions subtly change | High | Supply both icon variants and retain all current component interaction tests. |
| Circular package dependency is introduced | High | Build table-hook independently and search for table-view imports. |
| Breaking import migration misses a consumer | Medium | Search all source/docs imports and run affected package typechecks/builds. |
| Tests are moved mechanically and begin depending on UI | Medium | Use stub renderer callbacks in table-hook and retain component assertions in table-view. |
| Large plugin directories produce oversized tasks | Medium | Move one semantic unit and its focused tests per red-green cycle within each family task. |

## Open questions

None. The architecture, compatibility policy, icon fallback, custom-plugin
support, and documentation/test ownership have been approved.
