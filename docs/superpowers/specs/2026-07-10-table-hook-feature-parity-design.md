# Spec: Table Hook Feature Parity

## Objective

Update `@notion-kit/table-hook` so its table features match the current behavior of `@notion-kit/table-view` while preserving `table-hook` as the TanStack Table v9 beta prototype package.

The user is a notion-kit maintainer preparing the next milestone: migrating the table implementation toward TanStack Table v9. Success means `packages/table-hook/src/features` can be treated as the v9-compatible equivalent of `packages/table-view/src/features`, including the newer dnd-kit migration and Kanban/group drag behavior.

## Tech Stack

- TypeScript 6.0.3 with the repository's strict package configuration.
- React 19.
- Vitest 4.1.8 and Testing Library for feature tests.
- `@tanstack/react-table@9.0.0-beta.11` in `packages/table-hook`.
- `@tanstack/react-table@8.21.3` in `packages/table-view`.
- Current dnd-kit package family from the `ui` catalog, using `@dnd-kit/react` for `table-hook` feature drag event types and behavior.

## Commands

Run commands with the repository Node/pnpm defaults:

```bash
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm use 24.11.1 --silent
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook test
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook typecheck
$NVM_BIN/pnpm --config.store-dir=/Users/awen/Documents/Codex/.pnpm-store -F @notion-kit/table-hook build
```

Useful comparison commands:

```bash
git diff --no-index packages/table-hook/src/features packages/table-view/src/features
rg "@dnd-kit/core|@dnd-kit/sortable" packages/table-hook
rg "@dnd-kit/react|handleKanbanRowDragOver|handleRowDragEnd" packages/table-hook/src
```

## Project Structure

```txt
packages/table-view/src/features/
  Canonical feature behavior for the stable v8 table package.

packages/table-view/src/__tests__/
  Canonical feature tests and dnd-kit event fixtures to port behavior from.

packages/table-hook/src/features/
  Target v9-compatible feature implementation.

packages/table-hook/src/__tests__/
  Target v9-compatible tests proving feature parity.

packages/table-hook/src/table-contexts/
  v9 `useTable` integration and feature registration surface.
```

## Code Style

Keep the v9 feature extension shape in `table-hook`. Port behavior, not v8 extension syntax:

```ts
import type { DragEndEvent, DragOverEvent } from "@dnd-kit/react";
import type { Table, TableFeature } from "@tanstack/react-table";

export interface RowActionsTableApi {
  handleKanbanRowDragOver: (event: DragOverEvent) => void;
  handleRowDragEnd: (
    event: DragEndEvent,
    options?: { reorder?: boolean },
  ) => void;
}

export const RowActionsFeature: TableFeature = {
  getDefaultTableOptions: (): RowActionsOptions => ({}),
  constructTableAPIs: (table: Table<Row>) => {
    table.handleRowDragEnd = (event, options = {}) => {
      // Behavior should mirror table-view, adapted to table-hook's v9 APIs.
    };
  },
};
```

Conventions:

- Treat `packages/table-view/src/features` as behavioral source of truth.
- Preserve `table-hook` v9 APIs such as `TableState_FeatureMap`, `TableOptions_FeatureMap`, `Table_FeatureMap`, `constructTableAPIs`, and object-shaped `DEFAULT_FEATURES`.
- Prefer shared UI helpers already used by `table-view`, such as `getSortableItemsAfterDrag` and Kanban helpers, over stale local dnd logic.
- Remove `// @ts-nocheck` from touched feature files when practical, but do not expand the milestone into a full type cleanup if v9 beta definitions block progress.
- Keep imports package-local in `table-hook`; do not introduce `@/` aliases unless that package already supports them.

## Testing Strategy

Update `packages/table-hook/src/__tests__` so its feature tests cover the same user-visible behavior as `table-view` feature tests, adapted for the v9 table setup.

Required test coverage:

- Row CRUD, cell updates, row icon updates, and grouped state synchronization remain green.
- `handleRowDragEnd` reorders rows using `@dnd-kit/react` event shape.
- `handleRowDragEnd(event, { reorder: false })` commits grouped/Kanban moves without replaying preview reorder.
- `handleKanbanRowDragOver` previews Kanban row movement between groups and within groups.
- Grouping and column-info drag tests use `@dnd-kit/react`, not `@dnd-kit/core`.
- A search check confirms `table-hook` no longer imports `@dnd-kit/core` or `@dnd-kit/sortable`.

Verification commands are the package `test`, `typecheck`, and `build` commands listed above.

## Boundaries

- Always: preserve `table-hook` as the TanStack v9 beta prototype.
- Always: keep `table-view` behavior as the parity reference.
- Always: update tests with behavior changes.
- Always: migrate `table-hook` dnd-kit feature/test imports to `@dnd-kit/react`.
- Ask first: changing the public API of `@notion-kit/table-view`.
- Ask first: adding new dependencies outside the existing workspace catalog direction.
- Ask first: changing the repository-wide TanStack Table catalog version.
- Never: backport `table-hook` to TanStack v8 feature syntax.
- Never: remove failing tests instead of adapting or fixing them.
- Never: commit generated build output or dependency store files.

## Success Criteria

- `packages/table-hook/src/features` implements parity with current `packages/table-view/src/features` behavior, including Kanban/group drag behavior.
- `packages/table-hook` exposes `handleKanbanRowDragOver` and `handleRowDragEnd(event, options)` with behavior matching `table-view`.
- `packages/table-hook` no longer imports `@dnd-kit/core` or `@dnd-kit/sortable`.
- `packages/table-hook/package.json` uses the migrated dnd-kit dependencies needed by the new feature behavior.
- `packages/table-hook` remains on `@tanstack/react-table` beta and preserves v9 feature-map declarations.
- `@notion-kit/table-hook` tests, typecheck, and build pass.

## Open Questions

None for the specification phase. The user confirmed full feature parity with `table-view`, including newer Kanban/group drag behavior like `handleKanbanRowDragOver`.
