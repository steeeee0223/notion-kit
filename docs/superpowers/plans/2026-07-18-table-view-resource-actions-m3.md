# Table View Resource Actions M3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change Table View resource callbacks to emit `{ next, action }` envelopes with typed audit actions.

**Architecture:** Keep TanStack feature APIs updater-based, but add action context beside each updater. `useTableView` resolves the updater against the current resource, builds the final action from previous and next resources, and calls the public callback with one envelope. Cross-resource operations create one action id and reuse it for each emitted resource action.

**Tech Stack:** React 19, TypeScript 6, Vitest 4, TanStack React Table v9 beta, `@notion-kit/table-hook`, `@notion-kit/table-view`.

## Global Constraints

- Complete-resource replacement callbacks receive `{ next, action }`.
- Callback return values remain ignored and callbacks are invoked synchronously.
- Controlled resources remain unchanged until the owner supplies new props.
- Uncontrolled resources commit locally before callback notification.
- Action ids are generated once per user operation; multi-resource changes from one operation share that id.
- Action payloads contain compact audit data and do not copy the complete replacement resource.
- Activity-log serialization excludes `next`.

---

### Task 1: Action Envelope Types

**Files:**

- Modify: `packages/table-hook/src/table-contexts/types.ts`
- Create: `packages/table-hook/src/table-contexts/actions.ts`
- Modify: `packages/table-hook/src/table-contexts/index.ts`
- Modify: `packages/table-hook/src/index.ts`

**Interfaces:**

- Produces: `TableAction<TType, TPayload>`
- Produces: `ResourceChange<TResource, TAction>`
- Produces: `ResourceChangeHandler<TResource, TAction>`
- Produces: `DataResourceAction`, `PropertiesResourceAction`, `ViewResourceAction`
- Produces: `serializeResourceAction(change)` returning only `change.action`

- [ ] Write failing tests proving callback variables expose `next` and `action`.
- [ ] Add the action and envelope types.
- [ ] Update resource prop callback types to use resource-specific action unions.
- [ ] Export the new public types and serializer.
- [ ] Run `pnpm -F @notion-kit/table-hook test -- --run src/__tests__/resource-api.test.tsx`.

### Task 2: Resource Setter Action Plumbing

**Files:**

- Modify: `packages/table-hook/src/table-contexts/use-table-view.tsx`
- Modify: `packages/table-hook/src/features/row-actions.ts`
- Modify: `packages/table-hook/src/features/columns-info.ts`
- Modify: `packages/table-hook/src/features/menu.ts`

**Interfaces:**

- Consumes: action envelope types from Task 1.
- Produces: internal resource setters accepting an updater plus an action factory.

- [ ] Write failing tests for controlled and uncontrolled callbacks receiving envelopes.
- [ ] Change `useResourceState` to resolve `next`, build `action`, and invoke `onChange({ next, action })`.
- [ ] Keep pending controlled updater composition against the latest pending resource.
- [ ] Add action factory parameters to `setTableData`, `onTableDataChange`, `onColumnInfoChange`, and `onTableGlobalChange`.
- [ ] Run the focused resource API test.

### Task 3: Mutation Action Payloads

**Files:**

- Modify: `packages/table-hook/src/features/row-actions.ts`
- Modify: `packages/table-hook/src/features/columns-info.ts`
- Modify: `packages/table-hook/src/features/menu.ts`
- Test: `packages/table-hook/src/__tests__/resource-api.test.tsx`

**Interfaces:**

- Produces data actions for cell update; row create, update, delete, duplicate, and move.
- Produces property actions for create, update, delete, restore, duplicate, move, resize, visibility change, and type change.
- Produces view actions for layout, lock state, row display mode, and opened-row changes.

- [ ] Write failing tests for each action discriminant and representative payloads.
- [ ] Generate one `v4()` action id per public table operation.
- [ ] Reuse the same id for column create, type change, duplicate, and delete operations that change both properties and data.
- [ ] Build previous/next payload fields from the resolved previous and next resources.
- [ ] Run the focused resource API test.

### Task 4: Consumers And Documentation

**Files:**

- Modify: `packages/table-view/src/__tests__/component-objects/render-table-view.tsx`
- Modify: `packages/table-view/src/plugins/select/__tests__/utils.tsx`
- Modify: `packages/registry/src/table-view-controlled/table-view-controlled.tsx`
- Modify: `apps/storybook/src/stories/collections/table-view/table-view.stories.tsx`
- Modify: `apps/docs/content/docs/blocks/table-view/index.mdx`
- Modify: `apps/docs/content/docs/blocks/table-view/tutorial.mdx`

**Interfaces:**

- Consumes: public callback variables as `{ next, action }`.
- Produces: docs showing TanStack Query mutation variables, React state handlers, correlated action ids, and activity-log serialization.

- [ ] Update local React state examples to destructure `{ next }`.
- [ ] Keep mutation examples directly assignable to the callback shape.
- [ ] Document action union names and serializer behavior.
- [ ] Run table-view focused tests that use controlled wrappers.

### Task 5: Verification

**Files:**

- All files touched above.

**Interfaces:**

- Consumes: complete M3 implementation.
- Produces: passing focused tests and typechecks.

- [ ] Run `pnpm -F @notion-kit/table-hook test -- --run src/__tests__/resource-api.test.tsx`.
- [ ] Run `pnpm -F @notion-kit/table-view test`.
- [ ] Run `pnpm -F @notion-kit/table-hook typecheck`.
- [ ] Run `pnpm -F @notion-kit/table-view typecheck`.
- [ ] Run `git diff --check`.

## Self-Review

- Spec coverage: callback envelopes, action unions, previous/next audit fields, shared ids, assignable mutation variables, docs, and activity serialization are covered.
- Placeholder scan: no TBD/TODO placeholders.
- Type consistency: public callbacks use `ResourceChange<TResource, TAction>`; internal feature setters accept action factories so payloads can be computed after updater resolution.
