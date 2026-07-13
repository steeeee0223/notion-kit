# Table View Reactivity And Resource API Design

## Goal

Refactor `@notion-kit/table-hook` and `@notion-kit/table-view` so that the existing context provides table access, TanStack `Subscribe` and selectors provide rendered reactivity, and the public API models `data`, `properties`, and `view` as independently persisted resources.

The work is split into three milestones:

1. Investigate and apply subscription-based render optimization where it is necessary.
2. Replace the current callback-inferred ownership model with a clean controlled/uncontrolled resource API.
3. Add resource-change action payloads for backend persistence and activity-log generation.

## Scope

The design covers:

- `packages/table-hook`, especially `useTableView` and custom table feature update APIs.
- `packages/table-view`, including its context provider and table, list, board, menu, toolbar, and row-view consumers.
- Registry examples and Table View documentation that demonstrate controlled and uncontrolled usage.
- Tests for state ownership, reactive rendering, resource replacement callbacks, and action payloads.

The API is intentionally reconstructed. Existing callback-inferred controlled/uncontrolled behavior is not preserved or deprecated.

## Non-Goals

- Preserving the existing public API for backward compatibility.
- Tracking render counts as an automated test requirement.
- Making `useTableView` responsible for HTTP requests, retries, mutation status, optimistic rollback, or backend errors.
- Adding partial-resource persistence in this iteration. Each mutation sends a complete replacement resource.
- Storing complete resource snapshots in the activity log.
- Migrating to TanStack `createTableHook` or TanStack Table Context.
- Enabling React Compiler for `packages/table-view` as part of these milestones.

## Current State

`useTableView` currently decides ownership from callback presence:

- `onDataChange` makes data controlled.
- `onPropertiesChange` makes properties controlled.
- `onTableChange` makes table-global state controlled.

This conflates ownership with change notification. The uncontrolled behavior is also inconsistent: a new `properties` array resets locally edited properties, while later `data` and `table` prop changes are ignored.

`useTable` is called without a selector. It therefore subscribes `useTableView` to all registered table state. Its fresh React table facade is placed in one broad `TableViewContext`, causing unrelated consumers to become eligible for rerender whenever any selected table-state slice changes. Many consumers read `table.store.state` or state-dependent builder methods during render; those reads are snapshots rather than local subscriptions.

## Target Architecture

The architecture separates three concerns:

1. **Access:** the existing Table View context provides access to the table or a stable table handle.
2. **Reactivity:** `table.Subscribe`, standalone `Subscribe`, or selector hooks subscribe rendered subtrees to the state they need.
3. **Resource ownership:** `data`, `properties`, and `view` each use an explicit controlled or uncontrolled contract.

Backend integrations own controlled resources. Query or mutation adapters apply optimistic cache changes, persist replacements, reconcile server responses, and handle failures outside `useTableView`.

## Resource Model

The three persisted resources remain independently controllable:

- `data`: table rows and cell values.
- `properties`: ordered property definitions and configurations.
- `view`: view-specific presentation state currently represented by `TableGlobalState`, including layout, lock state, row display mode, and opened row id.

The public name `table` becomes `view`, and `onTableChange` becomes `onViewChange`. `TableViewState` should replace `TableGlobalState` as the public domain name. The TanStack table instance continues to use the name `table` internally.

## Controlled And Uncontrolled Contract

Controlled mode is the primary integration path:

```tsx
<TableView
  data={data}
  properties={properties}
  view={view}
  onDataChange={handleDataChange}
  onPropertiesChange={handlePropertiesChange}
  onViewChange={handleViewChange}
/>
```

Each controlled resource is authoritative. Table View emits a replacement but does not display an uncommitted replacement as internal state. The parent, query cache, or mutation adapter must commit the next resource.

Uncontrolled mode is a convenience path:

```tsx
<TableView
  defaultData={initialData}
  defaultProperties={initialProperties}
  defaultView={initialView}
/>
```

Uncontrolled defaults are consumed only when the component mounts. Later changes to a `default*` prop do not reset internal state. Consumers reset an uncontrolled table through an explicit reset API or by remounting it with a different React `key`.

The three resources may use different ownership modes in the same table. Controlled/uncontrolled switching for a resource during one mount is unsupported and should produce a development warning.

The type system should reject supplying both the controlled and uncontrolled source for one resource, such as `data` together with `defaultData`.

## Milestone 1: Subscription Investigation And Optimization

M1 investigates necessity before adding each optimization. It does not require automated render-count tracking.

### Investigation Method

Use React DevTools Profiler or a temporary local `<Profiler>` harness with representative data. Evaluate these interactions independently:

1. Column resizing.
2. Sorting and grouping.
3. Group expansion and collapse.
4. Column ordering, visibility, pinning, and freezing.
5. Opening and changing table menus.
6. Switching table, list, and board layouts.
7. Opening and closing row views.
8. Editing one cell and adding, deleting, or moving rows.

For each interaction, record which major subtrees commit and whether the work is caused by TanStack store updates or React-owned resource replacement. The investigation output should be a checked-in priority document or a clearly structured milestone report.

### Optimization Priority

The initial priority order is:

1. **Critical correctness prerequisites:** render-time `table.store.state` reads and state-dependent builder methods that would become stale after narrowing the root subscription.
2. **High-frequency store interactions:** column resizing, expansion, sorting, grouping, and pinning/freezing.
3. **Large fan-out boundaries:** table body/row model, header model, table/list/board layout roots, toolbar, menus, and row views.
4. **Per-row or per-column boundaries:** only when the investigation shows coarse subscriptions still perform material unnecessary work.
5. **React-owned resource replacements:** track separately because `Subscribe` does not prevent parent/provider rerenders caused by new `data`, `properties`, or `view` props.

### M1 Sequence

1. Build a render-dependency inventory covering explicit store reads and hidden getter dependencies.
2. Add coarse `Subscribe` boundaries while keeping the default root selector. This preserves current reactivity while the inventory is converted.
3. Add correctness tests that exercise each converted state transition.
4. Stabilize the internal access context if the investigation shows that the fresh `{ table }` facade still broadcasts through the tree.
5. Narrow only the internal `TableViewWrapper` root selector after every first-party rendered dependency is covered.
6. Re-profile the same interactions and narrow to atom, row, or column selectors only where the result justifies the added complexity.

M1 must not change the public resource API.

## Milestone 2: Controlled And Uncontrolled Resource API

M2 replaces the existing API without event/action payloads.

The public replacement callback temporarily receives only the complete next resource:

```ts
type ResourceChangeHandler<TResource> = (next: TResource) => unknown;
```

This supports mutation functions that accept a complete replacement resource:

```tsx
const replaceData = useMutation({ mutationFn: api.replaceData });

<TableView data={data} onDataChange={replaceData.mutate} />;
```

It also supports React state with no adapter:

```tsx
<TableView data={data} onDataChange={setData} />;
```

Internally, TanStack feature APIs may continue producing `Updater<T>` values, but `useTableView` must resolve the updater against the current resource before invoking the public callback. Operations that currently issue multiple updaters for one resource must be consolidated so they do not resolve repeatedly against the same controlled snapshot.

M2 requirements:

- Add explicit controlled and uncontrolled prop unions for every resource.
- Remove callback-presence ownership inference.
- Remove render-phase property resynchronization.
- Make default values mount-only.
- Preserve independent mixed ownership across resources.
- Warn in development when ownership changes during one mount.
- Define plugin-registry lifecycle behavior. The initial policy is that changing the plugin registry requires deterministic property renormalization; missing plugins must fail at the Table View boundary with a descriptive error rather than through a later non-null assertion.
- Update registry demos, docs, and tests to the reconstructed API.

## Milestone 3: Resource Action Payloads

M3 changes each replacement callback to receive a single mutation-variable envelope:

```ts
interface ResourceChange<TResource, TAction> {
  next: TResource;
  action: TAction;
}

type ResourceChangeHandler<TResource, TAction> = (
  change: ResourceChange<TResource, TAction>,
) => unknown;
```

This makes TanStack Query mutations directly assignable when their mutation variable is the resource-change envelope:

```tsx
const replaceData = useMutation({ mutationFn: api.replaceData });

<TableView data={data} onDataChange={replaceData.mutate} />;
```

Local React state uses the envelope explicitly:

```tsx
<TableView
  data={data}
  onDataChange={({ next }) => setData(next)}
/>
```

### Action Shape

```ts
interface TableAction<TType extends string, TPayload> {
  id: string;
  type: TType;
  payload: TPayload;
}
```

`id` is generated once per user operation. Changes to multiple resources caused by that operation share the same id, allowing the backend and activity log to correlate them. The backend supplies the authoritative actor and timestamp.

Actions are resource-specific discriminated unions:

- Data actions: cell update; row create, update, delete, duplicate, and move.
- Property actions: create, update, delete, restore, duplicate, move, resize, visibility change, and type change.
- View actions: layout, lock state, row display mode, and opened-row changes.

Action payloads contain compact audit information such as target ids, previous and next values, and previous and next positions. The `next` resource is used for complete-resource persistence and must not be copied into the activity-log record.

Custom table feature mutation APIs must carry action context alongside their internal updater. Cross-resource operations must create one action id and reuse it for every emitted resource change.

## Error And Mutation Handling

`useTableView` invokes resource callbacks synchronously and ignores their return values. It does not await `mutateAsync` or catch mutation failures.

Controlled resources remain unchanged until the owner supplies new props. For responsive backend-backed UIs, the mutation integration should update the query cache optimistically and roll back on failure.

Uncontrolled resources update locally before the optional notification callback is invoked. Callback failure does not automatically roll back uncontrolled state.

## Testing Strategy

### M1

- Characterization tests for sorting, grouping, expansion, sizing, pinning, menus, layouts, and row views.
- Tests proving converted rendered dependencies update correctly when isolated behind a subscription.
- A final stale-UI suite after narrowing the internal root selector.
- Manual profiler comparison before and after. Render-count assertions are not required.

### M2

- Controlled initialization and replacement for each resource.
- Controlled values remain unchanged until the owner commits `next`.
- Uncontrolled initialization and internal updates for each resource.
- Uncontrolled callbacks receive the concrete next resource.
- Default prop changes after mount are ignored.
- Invalid controlled/default combinations fail type tests.
- Ownership switching produces development warnings.
- Functional updater composition and multi-update consolidation.
- Mixed ownership combinations.
- Plugin replacement and missing-plugin validation.

### M3

- Every public mutation produces the correct action discriminant and payload.
- `next` contains the complete replacement resource.
- Previous and next audit values are accurate.
- One operation affecting multiple resources shares one action id.
- Mutation functions accepting `ResourceChange` are directly assignable.
- Activity-log serialization excludes the complete `next` resource.

## Documentation

Update the Table View documentation in each milestone:

- M1 documents supported selector/subscription primitives for custom children and warns that render-time store snapshots are not reactive.
- M2 documents the controlled-first backend integration and secondary `default*` API.
- M3 documents resource-change envelopes, action unions, multi-resource correlation, and activity-log usage.

## Milestone Completion Criteria

### M1

- The priority investigation is documented.
- Necessary first-party render dependencies use explicit subscriptions.
- The internal root subscription is narrowed only if the stale-UI suite passes.
- The profiler follow-up identifies the achieved improvement and remaining React-owned update costs.

### M2

- Controlled and uncontrolled ownership is explicit and consistent for all three resources.
- Legacy props and callback-inferred behavior are removed.
- Complete-resource mutation functions can be passed directly to controlled callbacks.
- Registry demos, docs, types, and tests use the reconstructed API.

### M3

- Complete-resource replacement callbacks receive `{ next, action }`.
- All supported mutations produce typed audit payloads.
- Cross-resource changes share a correlation id.
- Backend integrations can persist the replacement and create an activity record from one mutation variable.
