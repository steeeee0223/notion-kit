# Table View Resource API M2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace callback-inferred table resource ownership with explicit controlled and uncontrolled `data`, `properties`, and `view` resources.

**Architecture:** Keep TanStack feature APIs updater-based internally, but resolve each updater in `useTableView` before calling the public resource callback. `data`, `properties`, and `view` each get independent controlled/default prop unions and one mount-only uncontrolled state slot. Plugin normalization happens at the Table View boundary so missing plugins fail early and plugin registry replacement renormalizes properties deterministically.

**Tech Stack:** React 19, TypeScript 6, Vitest 4, TanStack React Table v9 beta, `@notion-kit/table-hook`, `@notion-kit/table-view`.

## Global Constraints

- M2 only: callbacks receive the complete next resource, not `{ next, action }`.
- Keep internal TanStack feature APIs accepting `Updater<T>`.
- Do not preserve legacy callback-presence ownership inference.
- `defaultData`, `defaultProperties`, and `defaultView` are mount-only.
- Controlled and uncontrolled switching during one mount is unsupported and warns in development.
- Supplying both controlled and default source for one resource must fail typechecking.
- Missing property plugins throw a descriptive Table View boundary error.

---

### Task 1: Resource Prop Types

**Files:**
- Modify: `packages/table-hook/src/table-contexts/types.ts`
- Modify: `packages/table-hook/src/features/menu.ts`
- Modify: `packages/table-hook/src/index.ts`

**Interfaces:**
- Produces: `ResourceChangeHandler<TResource> = (next: TResource) => unknown`
- Produces: `TableViewState` as the public alias/name for view state.
- Produces: `BaseTableProps<TPlugins>` with exclusive resource props:
  - controlled data: `data`, optional `onDataChange`, no `defaultData`
  - uncontrolled data: `defaultData`, optional `onDataChange`, no `data`
  - controlled properties: `properties`, optional `onPropertiesChange`, no `defaultProperties`
  - uncontrolled properties: `defaultProperties`, optional `onPropertiesChange`, no `properties`
  - controlled view: `view`, optional `onViewChange`, no `defaultView`
  - uncontrolled view: `defaultView`, optional `onViewChange`, no `view`

- [x] Add the public resource handler and resource prop union types.
- [x] Rename public `table?: Partial<TableGlobalState>` to `view?: Partial<TableViewState>`.
- [x] Rename public `onTableChange` to `onViewChange`.
- [x] Export `TableViewState` alongside the existing internal `TableGlobalState` compatibility type.
- [x] Run `pnpm -F @notion-kit/table-hook typecheck` and expect legacy call sites to fail until later tasks are updated.

### Task 2: Hook Ownership Semantics

**Files:**
- Modify: `packages/table-hook/src/table-contexts/use-table-view.tsx`
- Modify: `packages/table-hook/src/table-contexts/utils.ts`
- Test: `packages/table-hook/src/__tests__/resource-api.test.tsx`

**Interfaces:**
- Consumes: resource prop unions from Task 1.
- Produces: updater resolution helpers that call public callbacks with concrete resources.

- [x] Write failing tests for controlled data, properties, and view staying unchanged until rerendered with the callback `next` value.
- [x] Write failing tests for uncontrolled `default*` initialization, callback notification, and ignored default prop changes after mount.
- [x] Write failing tests for mixed ownership, ownership switching warnings, multi-update consolidation for column add/remove/type change, plugin registry replacement, and missing plugin errors.
- [x] Replace callback-presence ownership checks with explicit prop-presence checks.
- [x] Remove render-phase property resynchronization.
- [x] Add mount-only uncontrolled state initializers for all three resources.
- [x] Resolve `Updater<T>` values against the effective resource before invoking public callbacks.
- [x] For uncontrolled resources, commit the resolved value locally before invoking the optional callback.
- [x] For controlled resources, invoke callbacks synchronously and leave displayed state unchanged until parent props change.
- [x] Add development-only ownership switching warnings.
- [x] Change `toPropertyEntity` to throw when a property type has no plugin.
- [x] Run `pnpm -F @notion-kit/table-hook test -- --run src/__tests__/resource-api.test.tsx`.

### Task 3: Provider, Tests, And Examples

**Files:**
- Modify: `packages/table-view/src/table-contexts/table-view-provider.tsx`
- Modify: `packages/table-view/src/__tests__/component-objects/render-table-view.tsx`
- Modify: `packages/table-view/src/__tests__/mock.ts`
- Modify: `packages/table-view/src/plugins/select/__tests__/utils.tsx`
- Modify: `apps/storybook/src/stories/collections/table-view/table-menus.stories.tsx`
- Modify: `apps/storybook/src/stories/collections/table-view/table-view.stories.tsx`
- Modify: `apps/storybook/src/stories/collections/table-view/database/database.tsx`

**Interfaces:**
- Consumes: `TableProps<TPlugins>` with explicit resource props.
- Produces: first-party Table View usage migrated to `data`/`properties`/`view` or `defaultData`/`defaultProperties`/`defaultView`.

- [x] Update test helpers so public callbacks receive concrete replacement resources.
- [x] Migrate uncontrolled demos to `defaultData` and `defaultProperties`.
- [x] Migrate controlled demos to `data`, `properties`, `view`, and concrete replacement callbacks.
- [x] Replace any `table` prop usage with `view`.
- [x] Run `pnpm -F @notion-kit/table-view test -- --run src/table-contexts/table-view-reactivity.test.tsx`.

### Task 4: Documentation

**Files:**
- Modify: `apps/docs/content/docs/blocks/table-view/index.mdx`
- Modify: `apps/docs/content/docs/blocks/table-view/tutorial.mdx`

**Interfaces:**
- Produces: M2 documentation showing controlled-first backend integration and secondary default API.

- [x] Replace legacy `table`/`onTableChange` documentation with `view`/`onViewChange`.
- [x] Document controlled callbacks as complete-resource replacement callbacks.
- [x] Document `defaultData`, `defaultProperties`, and `defaultView` as mount-only convenience props.
- [x] Update examples so mutation functions and React state setters can be passed directly.

### Task 5: Verification

**Files:**
- All files touched above.

**Interfaces:**
- Consumes: complete M2 implementation.
- Produces: passing focused tests and package typechecks.

- [x] Run `pnpm -F @notion-kit/table-hook test`.
- [x] Run `pnpm -F @notion-kit/table-view test`.
- [x] Run `pnpm -F @notion-kit/table-hook typecheck`.
- [x] Run `pnpm -F @notion-kit/table-view typecheck`.
- [x] Run `git diff --check`.

## Self-Review

- Spec coverage: M2 ownership, defaults, callbacks, switching warnings, plugin lifecycle, demos, docs, and tests are covered.
- Placeholder scan: no TBD/TODO placeholders.
- Type consistency: `view`/`onViewChange`/`TableViewState` are used as the public names; `TableGlobalState` remains only as the internal compatibility type.
